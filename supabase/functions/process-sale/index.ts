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

    const { sale_data } = await req.json()

    // Process the sale
    const result = await processSale(supabaseClient, sale_data, user.id)

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

async function processSale(supabaseClient: any, saleData: any, userId: string) {
  const { items, customer_info, payment_info, notes } = saleData

  // Validate items and check stock
  for (const item of items) {
    const { data: inventory } = await supabaseClient
      .from('inventory_levels')
      .select('available_stock')
      .eq('product_id', item.product_id)
      .single()

    if (!inventory || inventory.available_stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.product_name}`)
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
  const tax_rate = 0.08 // 8% tax rate
  const tax_amount = subtotal * tax_rate
  const total_amount = subtotal + tax_amount

  // Generate sale number
  const { data: saleNumber } = await supabaseClient
    .rpc('generate_sale_number')

  // Create sale record
  const { data: sale, error: saleError } = await supabaseClient
    .from('sales')
    .insert({
      sale_number: saleNumber,
      customer_name: customer_info.name,
      customer_phone: customer_info.phone,
      customer_email: customer_info.email,
      subtotal,
      tax_amount,
      total_amount,
      payment_method: payment_info.method,
      payment_status: 'completed',
      cashier_id: userId,
      notes
    })
    .select()
    .single()

  if (saleError) {
    throw new Error(`Failed to create sale: ${saleError.message}`)
  }

  // Create sale items and update inventory
  const saleItems = []
  const stockMovements = []

  for (const item of items) {
    // Create sale item
    const { data: saleItem, error: itemError } = await supabaseClient
      .from('sale_items')
      .insert({
        sale_id: sale.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      })
      .select()
      .single()

    if (itemError) {
      throw new Error(`Failed to create sale item: ${itemError.message}`)
    }

    saleItems.push(saleItem)

    // Create stock movement
    const { data: stockMovement, error: movementError } = await supabaseClient
      .from('stock_movements')
      .insert({
        product_id: item.product_id,
        movement_type: 'out',
        quantity: item.quantity,
        reference_number: sale.sale_number,
        reference_type: 'sale',
        reference_id: sale.id,
        notes: `Sale: ${sale.sale_number}`,
        user_id: userId
      })
      .select()
      .single()

    if (movementError) {
      throw new Error(`Failed to create stock movement: ${movementError.message}`)
    }

    stockMovements.push(stockMovement)
  }

  // Get updated sale with items
  const { data: completeSale } = await supabaseClient
    .from('sales')
    .select(`
      *,
      sale_items(*),
      profiles!sales_cashier_id_fkey(first_name, last_name)
    `)
    .eq('id', sale.id)
    .single()

  return {
    success: true,
    sale: completeSale,
    message: 'Sale processed successfully'
  }
}
