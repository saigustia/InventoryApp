import { BaseEntity } from './common';

export interface Product extends BaseEntity {
  name: string;
  category: ProductCategory;
  stock: number;
  min_stock: number;
  price: number;
  unit: string;
  description?: string;
  image_url?: string;
  barcode?: string;
  supplier?: string;
  cost_price?: number;
  margin?: number;
}

export type ProductCategory = 'Ice Cream' | 'Toppings' | 'Fruits' | 'Supplies';

export interface StockAdjustment extends BaseEntity {
  product_id: string;
  quantity: number;
  reason: string;
  type: 'in' | 'out';
  reference?: string; // Purchase order, sale ID, etc.
}

export interface InventoryAlert {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  created_at: string;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  stock: string;
  min_stock: string;
  price: string;
  unit: string;
  description?: string;
  barcode?: string;
  supplier?: string;
  cost_price?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: Record<ProductCategory, number>;
}
