import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { period, category_id } = await req.json()

    // Calculate inventory analytics
    const analytics = await calculateInventoryAnalytics(supabaseClient, period, category_id)

    return new Response(
      JSON.stringify(analytics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function calculateInventoryAnalytics(supabaseClient: any, period: string, category_id?: string) {
  const now = new Date()
  const startDate = new Date()
  
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }

  // Get inventory levels
  let inventoryQuery = supabaseClient
    .from('inventory_levels')
    .select(`
      current_stock,
      available_stock,
      products!inner(
        id,
        name,
        category_id,
        selling_price,
        min_stock_level,
        categories(name)
      )
    `)

  if (category_id) {
    inventoryQuery = inventoryQuery.eq('products.category_id', category_id)
  }

  const { data: inventoryLevels } = await inventoryQuery

  // Get stock movements
  let movementsQuery = supabaseClient
    .from('stock_movements')
    .select(`
      movement_type,
      quantity,
      created_at,
      products!inner(
        id,
        name,
        category_id,
        categories(name)
      )
    `)
    .gte('created_at', startDate.toISOString())

  if (category_id) {
    movementsQuery = movementsQuery.eq('products.category_id', category_id)
  }

  const { data: stockMovements } = await movementsQuery

  // Get sales data
  let salesQuery = supabaseClient
    .from('sale_items')
    .select(`
      quantity,
      total_price,
      created_at,
      products!inner(
        id,
        name,
        category_id,
        categories(name)
      )
    `)
    .gte('created_at', startDate.toISOString())

  if (category_id) {
    salesQuery = salesQuery.eq('products.category_id', category_id)
  }

  const { data: salesData } = await salesQuery

  // Calculate analytics
  const totalProducts = inventoryLevels?.length || 0
  const totalValue = inventoryLevels?.reduce((sum: number, item: any) => 
    sum + (item.current_stock * item.products.selling_price), 0) || 0
  
  const lowStockItems = inventoryLevels?.filter((item: any) => 
    item.current_stock <= item.products.min_stock_level).length || 0
  
  const outOfStockItems = inventoryLevels?.filter((item: any) => 
    item.current_stock <= 0).length || 0

  // Calculate movement analytics
  const totalIn = stockMovements?.filter((m: any) => m.movement_type === 'in')
    .reduce((sum: number, m: any) => sum + m.quantity, 0) || 0
  
  const totalOut = stockMovements?.filter((m: any) => m.movement_type === 'out')
    .reduce((sum: number, m: any) => sum + m.quantity, 0) || 0

  // Calculate sales analytics
  const totalSales = salesData?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  const totalRevenue = salesData?.reduce((sum: number, item: any) => sum + item.total_price, 0) || 0

  // Top selling products
  const productSales = salesData?.reduce((acc: any, item: any) => {
    const productId = item.products.id
    if (!acc[productId]) {
      acc[productId] = {
        product_name: item.products.name,
        category_name: item.products.categories.name,
        quantity_sold: 0,
        revenue: 0
      }
    }
    acc[productId].quantity_sold += item.quantity
    acc[productId].revenue += item.total_price
    return acc
  }, {}) || {}

  const topSellingProducts = Object.values(productSales)
    .sort((a: any, b: any) => b.quantity_sold - a.quantity_sold)
    .slice(0, 10)

  // Category breakdown
  const categoryBreakdown = inventoryLevels?.reduce((acc: any, item: any) => {
    const categoryName = item.products.categories.name
    if (!acc[categoryName]) {
      acc[categoryName] = {
        total_products: 0,
        total_value: 0,
        low_stock_count: 0
      }
    }
    acc[categoryName].total_products += 1
    acc[categoryName].total_value += item.current_stock * item.products.selling_price
    if (item.current_stock <= item.products.min_stock_level) {
      acc[categoryName].low_stock_count += 1
    }
    return acc
  }, {}) || {}

  return {
    summary: {
      total_products: totalProducts,
      total_value: totalValue,
      low_stock_items: lowStockItems,
      out_of_stock_items: outOfStockItems,
      total_in_movements: totalIn,
      total_out_movements: totalOut,
      total_sales_quantity: totalSales,
      total_revenue: totalRevenue
    },
    top_selling_products: topSellingProducts,
    category_breakdown: categoryBreakdown,
    period: period,
    generated_at: new Date().toISOString()
  }
}
