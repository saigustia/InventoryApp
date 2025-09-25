import { supabase } from './client';
import { flipperDebug } from '@/utils/debugging/flipper';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  supplier_id?: string;
  sku?: string;
  barcode?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level?: number;
  reorder_point: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  categories?: { name: string; color: string; icon: string };
  suppliers?: { name: string };
  inventory_levels?: { current_stock: number; available_stock: number };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  payment_terms?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reference_number?: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  user_id?: string;
  created_at: string;
  // Joined data
  products?: { name: string; categories?: { name: string } };
  profiles?: { first_name: string; last_name: string };
}

export interface InventoryService {
  // Products
  getProducts: (filters?: { category_id?: string; search?: string; is_active?: boolean }) => Promise<{ data: Product[] | null; error: any }>;
  getProduct: (id: string) => Promise<{ data: Product | null; error: any }>;
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Product | null; error: any }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ data: Product | null; error: any }>;
  deleteProduct: (id: string) => Promise<{ error: any }>;
  
  // Categories
  getCategories: () => Promise<{ data: Category[] | null; error: any }>;
  createCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Category | null; error: any }>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<{ data: Category | null; error: any }>;
  deleteCategory: (id: string) => Promise<{ error: any }>;
  
  // Suppliers
  getSuppliers: () => Promise<{ data: Supplier[] | null; error: any }>;
  createSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Supplier | null; error: any }>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<{ data: Supplier | null; error: any }>;
  deleteSupplier: (id: string) => Promise<{ error: any }>;
  
  // Stock Management
  getInventoryLevels: () => Promise<{ data: any[] | null; error: any }>;
  getStockMovements: (product_id?: string, limit?: number) => Promise<{ data: StockMovement[] | null; error: any }>;
  createStockMovement: (movement: Omit<StockMovement, 'id' | 'created_at'>) => Promise<{ data: StockMovement | null; error: any }>;
  getLowStockProducts: () => Promise<{ data: Product[] | null; error: any }>;
  
  // Analytics
  getInventoryAnalytics: (period?: string, category_id?: string) => Promise<{ data: any; error: any }>;
}

export const inventoryService: InventoryService = {
  async getProducts(filters = {}) {
    try {
      flipperDebug.logNetwork('GET', '/products', filters);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name, color, icon),
          suppliers(name),
          inventory_levels(current_stock, available_stock)
        `)
        .order('name');

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) {
        flipperDebug.logError(error, 'Get Products');
      } else {
        flipperDebug.logResponse('GET', '/products', 200, { count: data?.length });
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Products');
      return { data: null, error };
    }
  },

  async getProduct(id: string) {
    try {
      flipperDebug.logNetwork('GET', `/products/${id}`);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, color, icon),
          suppliers(name),
          inventory_levels(current_stock, available_stock)
        `)
        .eq('id', id)
        .single();

      if (error) {
        flipperDebug.logError(error, 'Get Product');
      } else {
        flipperDebug.logResponse('GET', `/products/${id}`, 200, data);
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Product');
      return { data: null, error };
    }
  },

  async createProduct(product) {
    try {
      flipperDebug.logUserAction('Create Product', { name: product.name });
      
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select(`
          *,
          categories(name, color, icon),
          suppliers(name),
          inventory_levels(current_stock, available_stock)
        `)
        .single();

      if (error) {
        flipperDebug.logError(error, 'Create Product');
      } else {
        flipperDebug.logUserAction('Product Created', { id: data.id, name: data.name });
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Create Product');
      return { data: null, error };
    }
  },

  async updateProduct(id: string, updates) {
    try {
      flipperDebug.logUserAction('Update Product', { id, updates });
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categories(name, color, icon),
          suppliers(name),
          inventory_levels(current_stock, available_stock)
        `)
        .single();

      if (error) {
        flipperDebug.logError(error, 'Update Product');
      } else {
        flipperDebug.logUserAction('Product Updated', { id, name: data.name });
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Update Product');
      return { data: null, error };
    }
  },

  async deleteProduct(id: string) {
    try {
      flipperDebug.logUserAction('Delete Product', { id });
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        flipperDebug.logError(error, 'Delete Product');
      } else {
        flipperDebug.logUserAction('Product Deleted', { id });
      }

      return { error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Delete Product');
      return { error };
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Categories');
      return { data: null, error };
    }
  },

  async createCategory(category) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Create Category');
      return { data: null, error };
    }
  },

  async updateCategory(id: string, updates) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Update Category');
      return { data: null, error };
    }
  },

  async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Delete Category');
      return { error };
    }
  },

  async getSuppliers() {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Suppliers');
      return { data: null, error };
    }
  },

  async createSupplier(supplier) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Create Supplier');
      return { data: null, error };
    }
  },

  async updateSupplier(id: string, updates) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Update Supplier');
      return { data: null, error };
    }
  },

  async deleteSupplier(id: string) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Delete Supplier');
      return { error };
    }
  },

  async getInventoryLevels() {
    try {
      const { data, error } = await supabase
        .from('inventory_levels')
        .select(`
          *,
          products(name, category_id, categories(name))
        `);
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Inventory Levels');
      return { data: null, error };
    }
  },

  async getStockMovements(product_id?: string, limit = 50) {
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          products(name, categories(name)),
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Stock Movements');
      return { data: null, error };
    }
  },

  async createStockMovement(movement) {
    try {
      flipperDebug.logUserAction('Create Stock Movement', { 
        product_id: movement.product_id, 
        type: movement.movement_type, 
        quantity: movement.quantity 
      });
      
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([movement])
        .select(`
          *,
          products(name, categories(name)),
          profiles(first_name, last_name)
        `)
        .single();

      if (error) {
        flipperDebug.logError(error, 'Create Stock Movement');
      } else {
        flipperDebug.logUserAction('Stock Movement Created', { id: data.id });
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Create Stock Movement');
      return { data: null, error };
    }
  },

  async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, color, icon),
          suppliers(name),
          inventory_levels(current_stock, available_stock)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        return { data: null, error };
      }

      // Filter products with low stock
      const lowStockProducts = data?.filter(product => 
        product.inventory_levels && 
        product.inventory_levels.current_stock <= product.min_stock_level
      ) || [];

      return { data: lowStockProducts, error: null };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Low Stock Products');
      return { data: null, error };
    }
  },

  async getInventoryAnalytics(period = '30d', category_id?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-inventory-analytics', {
        body: { period, category_id }
      });

      if (error) {
        flipperDebug.logError(error, 'Get Inventory Analytics');
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Inventory Analytics');
      return { data: null, error };
    }
  },
};
