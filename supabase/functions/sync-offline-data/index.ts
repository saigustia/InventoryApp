import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { sync_data } = await req.json()

    // Process offline data sync
    const result = await syncOfflineData(supabaseClient, sync_data, user.id)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncOfflineData(supabaseClient: any, syncData: any, userId: string) {
  const { sales, stock_movements, last_sync_time } = syncData
  const results = {
    sales_synced: 0,
    movements_synced: 0,
    conflicts_resolved: 0,
    errors: []
  }

  // Sync sales
  for (const sale of sales) {
    try {
      // Check if sale already exists
      const { data: existingSale } = await supabaseClient
        .from('sales')
        .select('id')
        .eq('sale_number', sale.sale_number)
        .single()

      if (existingSale) {
        // Conflict resolution - keep server version
        results.conflicts_resolved++
        continue
      }

      // Create sale
      const { data: newSale, error: saleError } = await supabaseClient
        .from('sales')
        .insert({
          ...sale,
          cashier_id: userId,
          created_at: sale.created_at || new Date().toISOString()
        })
        .select()
        .single()

      if (saleError) {
        results.errors.push(`Sale ${sale.sale_number}: ${saleError.message}`)
        continue
      }

      // Create sale items
      for (const item of sale.items) {
        const { error: itemError } = await supabaseClient
          .from('sale_items')
          .insert({
            sale_id: newSale.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at || new Date().toISOString()
          })

        if (itemError) {
          results.errors.push(`Sale item ${item.product_name}: ${itemError.message}`)
        }
      }

      results.sales_synced++
    } catch (error) {
      results.errors.push(`Sale ${sale.sale_number}: ${error.message}`)
    }
  }

  // Sync stock movements
  for (const movement of stock_movements) {
    try {
      // Check if movement already exists
      const { data: existingMovement } = await supabaseClient
        .from('stock_movements')
        .select('id')
        .eq('reference_number', movement.reference_number)
        .eq('product_id', movement.product_id)
        .eq('quantity', movement.quantity)
        .single()

      if (existingMovement) {
        results.conflicts_resolved++
        continue
      }

      // Create stock movement
      const { error: movementError } = await supabaseClient
        .from('stock_movements')
        .insert({
          ...movement,
          user_id: userId,
          created_at: movement.created_at || new Date().toISOString()
        })

      if (movementError) {
        results.errors.push(`Stock movement: ${movementError.message}`)
        continue
      }

      results.movements_synced++
    } catch (error) {
      results.errors.push(`Stock movement: ${error.message}`)
    }
  }

  // Get updated data for client
  const updatedData = await getUpdatedData(supabaseClient, last_sync_time)

  return {
    success: true,
    results,
    updated_data: updatedData,
    sync_timestamp: new Date().toISOString()
  }
}

async function getUpdatedData(supabaseClient: any, lastSyncTime: string) {
  const syncTime = new Date(lastSyncTime)

  // Get updated products
  const { data: products } = await supabaseClient
    .from('products')
    .select(`
      *,
      categories(name),
      suppliers(name),
      inventory_levels(current_stock, available_stock)
    `)
    .gte('updated_at', syncTime.toISOString())

  // Get updated inventory levels
  const { data: inventoryLevels } = await supabaseClient
    .from('inventory_levels')
    .select(`
      *,
      products(name, category_id, categories(name))
    `)
    .gte('updated_at', syncTime.toISOString())

  // Get new stock movements
  const { data: stockMovements } = await supabaseClient
    .from('stock_movements')
    .select(`
      *,
      products(name, category_id, categories(name))
    `)
    .gte('created_at', syncTime.toISOString())

  return {
    products: products || [],
    inventory_levels: inventoryLevels || [],
    stock_movements: stockMovements || []
  }
}
