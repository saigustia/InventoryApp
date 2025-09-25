import { BaseEntity } from './common';

export interface Sale extends BaseEntity {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  total_amount: number;
  tax_amount: number;
  discount_amount?: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  items: SaleItem[];
  notes?: string;
  cashier_id?: string;
  location_id?: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'check';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  stock: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalTax: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
}

export interface DailySales {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  sales: Sale[];
}

export interface SalesFormData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: PaymentMethod;
  notes: string;
}
