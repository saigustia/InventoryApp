import SQLite from 'react-native-sqlite-storage';
import { flipperDebug } from '@/utils/debugging/flipper';

// Enable promise-based API
SQLite.enablePromise(true);

export interface OfflineProduct {
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
  current_stock: number;
  available_stock: number;
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_synced?: string;
}

export interface OfflineSale {
  id: string;
  sale_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  cashier_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_synced?: string;
}

export interface OfflineSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number;
  created_at: string;
}

export interface OfflineStockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reference_number?: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  user_id?: string;
  created_at: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_synced?: string;
}

export interface SyncQueueItem {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  created_at: string;
  retry_count: number;
  last_error?: string;
}

class OfflineDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabase({
        name: 'IceCreamInventory.db',
        location: 'default',
      });

      await this.createTables();
      this.isInitialized = true;
      
      flipperDebug.logUserAction('Offline Database Initialized');
    } catch (error) {
      flipperDebug.logError(error as Error, 'Offline Database Initialization');
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTablesSQL = `
      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL,
        supplier_id TEXT,
        sku TEXT,
        barcode TEXT,
        unit TEXT NOT NULL,
        cost_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        min_stock_level INTEGER NOT NULL,
        max_stock_level INTEGER,
        reorder_point INTEGER NOT NULL,
        image_url TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        current_stock INTEGER NOT NULL DEFAULT 0,
        available_stock INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'synced',
        last_synced TEXT
      );

      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT NOT NULL DEFAULT 'US',
        payment_terms TEXT,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Sales table
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        sale_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        subtotal REAL NOT NULL,
        tax_amount REAL NOT NULL,
        discount_amount REAL,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        cashier_id TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced TEXT
      );

      -- Sale items table
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
      );

      -- Stock movements table
      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        movement_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reference_number TEXT,
        reference_type TEXT,
        reference_id TEXT,
        notes TEXT,
        user_id TEXT,
        created_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        last_synced TEXT
      );

      -- Sync queue table
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sync_status ON products(sync_status);
      CREATE INDEX IF NOT EXISTS idx_sales_sync_status ON sales(sync_status);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_sync_status ON stock_movements(sync_status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
    `;

    await this.db.executeSql(createTablesSQL);
  }

  // Products operations
  async getProducts(): Promise<OfflineProduct[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY name'
    );

    const products: OfflineProduct[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      products.push(results.rows.item(i));
    }

    return products;
  }

  async getProduct(id: string): Promise<OfflineProduct | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (results.rows.length > 0) {
      return results.rows.item(0);
    }

    return null;
  }

  async saveProduct(product: OfflineProduct): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT OR REPLACE INTO products (
        id, name, description, category_id, supplier_id, sku, barcode,
        unit, cost_price, selling_price, min_stock_level, max_stock_level,
        reorder_point, image_url, is_active, current_stock, available_stock,
        created_at, updated_at, sync_status, last_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(sql, [
      product.id, product.name, product.description, product.category_id,
      product.supplier_id, product.sku, product.barcode, product.unit,
      product.cost_price, product.selling_price, product.min_stock_level,
      product.max_stock_level, product.reorder_point, product.image_url,
      product.is_active ? 1 : 0, product.current_stock, product.available_stock,
      product.created_at, product.updated_at, product.sync_status, product.last_synced
    ]);

    // Add to sync queue if not synced
    if (product.sync_status !== 'synced') {
      await this.addToSyncQueue('products', product.id, 'create', product);
    }
  }

  // Sales operations
  async saveSale(sale: OfflineSale, items: OfflineSaleItem[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.transaction(async (tx) => {
      // Save sale
      const saleSql = `
        INSERT OR REPLACE INTO sales (
          id, sale_number, customer_name, customer_phone, customer_email,
          subtotal, tax_amount, discount_amount, total_amount, payment_method,
          payment_status, cashier_id, notes, created_at, updated_at,
          sync_status, last_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await tx.executeSql(saleSql, [
        sale.id, sale.sale_number, sale.customer_name, sale.customer_phone,
        sale.customer_email, sale.subtotal, sale.tax_amount, sale.discount_amount,
        sale.total_amount, sale.payment_method, sale.payment_status, sale.cashier_id,
        sale.notes, sale.created_at, sale.updated_at, sale.sync_status, sale.last_synced
      ]);

      // Save sale items
      for (const item of items) {
        const itemSql = `
          INSERT OR REPLACE INTO sale_items (
            id, sale_id, product_id, product_name, quantity, unit_price,
            total_price, discount, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await tx.executeSql(itemSql, [
          item.id, item.sale_id, item.product_id, item.product_name,
          item.quantity, item.unit_price, item.total_price, item.discount || 0,
          item.created_at
        ]);
      }
    });

    // Add to sync queue
    await this.addToSyncQueue('sales', sale.id, 'create', { sale, items });
  }

  async getPendingSales(): Promise<OfflineSale[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM sales WHERE sync_status = ? ORDER BY created_at',
      ['pending']
    );

    const sales: OfflineSale[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      sales.push(results.rows.item(i));
    }

    return sales;
  }

  // Stock movements operations
  async saveStockMovement(movement: OfflineStockMovement): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT OR REPLACE INTO stock_movements (
        id, product_id, movement_type, quantity, reference_number,
        reference_type, reference_id, notes, user_id, created_at,
        sync_status, last_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(sql, [
      movement.id, movement.product_id, movement.movement_type, movement.quantity,
      movement.reference_number, movement.reference_type, movement.reference_id,
      movement.notes, movement.user_id, movement.created_at, movement.sync_status,
      movement.last_synced
    ]);

    // Add to sync queue
    await this.addToSyncQueue('stock_movements', movement.id, 'create', movement);
  }

  // Sync queue operations
  async addToSyncQueue(tableName: string, recordId: string, operation: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT INTO sync_queue (id, table_name, record_id, operation, data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const id = `${tableName}_${recordId}_${Date.now()}`;
    const dataJson = JSON.stringify(data);

    await this.db.executeSql(sql, [
      id, tableName, recordId, operation, dataJson, new Date().toISOString()
    ]);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(
      'SELECT * FROM sync_queue ORDER BY created_at'
    );

    const items: SyncQueueItem[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const item = results.rows.item(i);
      item.data = JSON.parse(item.data);
      items.push(item);
    }

    return items;
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  async updateSyncStatus(tableName: string, recordId: string, status: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `UPDATE ${tableName} SET sync_status = ?, last_synced = ? WHERE id = ?`;
    await this.db.executeSql(sql, [status, new Date().toISOString(), recordId]);
  }

  // Utility methods
  async clearDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = ['products', 'categories', 'suppliers', 'sales', 'sale_items', 'stock_movements', 'sync_queue'];
    
    for (const table of tables) {
      await this.db.executeSql(`DELETE FROM ${table}`);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const offlineDatabase = new OfflineDatabase();
