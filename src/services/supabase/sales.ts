import { supabase } from './client';

export interface Sale {
  id: string;
  customer_name?: string;
  total_amount: number;
  tax_amount: number;
  payment_method: 'cash' | 'card' | 'mobile';
  items: SaleItem[];
  created_at: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SalesService {
  createSale: (sale: Omit<Sale, 'id' | 'created_at'>) => Promise<{ data: Sale | null; error: any }>;
  getSales: (startDate?: string, endDate?: string) => Promise<{ data: Sale[] | null; error: any }>;
  getSale: (id: string) => Promise<{ data: Sale | null; error: any }>;
  getDailySales: (date: string) => Promise<{ data: Sale[] | null; error: any }>;
  getSalesSummary: (startDate: string, endDate: string) => Promise<{ data: any; error: any }>;
}

export const salesService: SalesService = {
  async createSale(sale) {
    const { data, error } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();
    return { data, error };
  },

  async getSales(startDate?: string, endDate?: string) {
    let query = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getSale(id: string) {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async getDailySales(date: string) {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getSalesSummary(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('sales')
      .select('total_amount, tax_amount, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) return { data: null, error };

    const summary = data?.reduce(
      (acc, sale) => ({
        totalRevenue: acc.totalRevenue + sale.total_amount,
        totalTax: acc.totalTax + sale.tax_amount,
        totalOrders: acc.totalOrders + 1,
      }),
      { totalRevenue: 0, totalTax: 0, totalOrders: 0 }
    );

    return { data: summary, error: null };
  },
};
