import { supabase } from '../supabase/client';
import { offlineDatabase } from './offlineDatabase';
import { flipperDebug } from '@/utils/debugging/flipper';
import NetInfo from '@react-native-community/netinfo';

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
  lastSyncTime: string;
}

export interface SyncOptions {
  forceSync?: boolean;
  syncOnlyPending?: boolean;
  onProgress?: (progress: number) => void;
}

class SyncService {
  private isOnline = false;
  private isSyncing = false;
  private lastSyncTime: string | null = null;
  private syncListeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.initializeNetworkListener();
  }

  private async initializeNetworkListener(): Promise<void> {
    // Listen for network state changes
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (this.isOnline && !wasOnline) {
        flipperDebug.logUserAction('Network Connected - Starting Sync');
        this.syncPendingData();
      } else if (!this.isOnline && wasOnline) {
        flipperDebug.logUserAction('Network Disconnected - Going Offline');
      }

      // Notify listeners
      this.syncListeners.forEach(listener => listener(this.isOnline));
    });

    // Check initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
  }

  addNetworkListener(listener: (isOnline: boolean) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  async syncPendingData(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing && !options.forceSync) {
      flipperDebug.logUserAction('Sync Already In Progress');
      return {
        success: false,
        syncedItems: 0,
        errors: ['Sync already in progress'],
        lastSyncTime: this.lastSyncTime || new Date().toISOString()
      };
    }

    if (!this.isOnline) {
      flipperDebug.logUserAction('Sync Skipped - No Network Connection');
      return {
        success: false,
        syncedItems: 0,
        errors: ['No network connection'],
        lastSyncTime: this.lastSyncTime || new Date().toISOString()
      };
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      flipperDebug.logUserAction('Starting Data Sync');

      const result: SyncResult = {
        success: true,
        syncedItems: 0,
        errors: [],
        lastSyncTime: new Date().toISOString()
      };

      // Sync products first
      await this.syncProducts(options, result);

      // Sync sales
      await this.syncSales(options, result);

      // Sync stock movements
      await this.syncStockMovements(options, result);

      // Update last sync time
      this.lastSyncTime = result.lastSyncTime;

      const duration = Date.now() - startTime;
      flipperDebug.logPerformance('Data Sync', duration);
      flipperDebug.logUserAction('Data Sync Completed', {
        syncedItems: result.syncedItems,
        errors: result.errors.length,
        duration
      });

      return result;
    } catch (error) {
      flipperDebug.logError(error as Error, 'Data Sync');
      return {
        success: false,
        syncedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastSyncTime: this.lastSyncTime || new Date().toISOString()
      };
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncProducts(options: SyncOptions, result: SyncResult): Promise<void> {
    try {
      // Get products from server
      const { data: serverProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, color, icon),
          suppliers(name),
          inventory_levels(current_stock, available_stock)
        `);

      if (error) {
        result.errors.push(`Failed to fetch products: ${error.message}`);
        return;
      }

      // Update local database
      for (const product of serverProducts || []) {
        const offlineProduct = {
          ...product,
          current_stock: product.inventory_levels?.current_stock || 0,
          available_stock: product.inventory_levels?.available_stock || 0,
          sync_status: 'synced' as const,
          last_synced: new Date().toISOString()
        };

        await offlineDatabase.saveProduct(offlineProduct);
        result.syncedItems++;
      }

      flipperDebug.logUserAction('Products Synced', { count: serverProducts?.length || 0 });
    } catch (error) {
      result.errors.push(`Product sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async syncSales(options: SyncOptions, result: SyncResult): Promise<void> {
    try {
      // Get pending sales from local database
      const pendingSales = await offlineDatabase.getPendingSales();

      for (const sale of pendingSales) {
        try {
          // Get sale items
          const saleItems = await this.getSaleItems(sale.id);

          // Sync to server using edge function
          const { data, error } = await supabase.functions.invoke('sync-offline-data', {
            body: {
              sync_data: {
                sales: [{
                  ...sale,
                  items: saleItems
                }],
                stock_movements: [],
                last_sync_time: this.lastSyncTime
              }
            }
          });

          if (error) {
            result.errors.push(`Failed to sync sale ${sale.sale_number}: ${error.message}`);
            continue;
          }

          // Update sync status
          await offlineDatabase.updateSyncStatus('sales', sale.id, 'synced');
          result.syncedItems++;

          flipperDebug.logUserAction('Sale Synced', { saleNumber: sale.sale_number });
        } catch (error) {
          result.errors.push(`Sale sync error for ${sale.sale_number}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      result.errors.push(`Sales sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async syncStockMovements(options: SyncOptions, result: SyncResult): Promise<void> {
    try {
      // Get pending stock movements from sync queue
      const syncQueue = await offlineDatabase.getSyncQueue();
      const stockMovements = syncQueue.filter(item => item.table_name === 'stock_movements');

      for (const item of stockMovements) {
        try {
          const movement = item.data;

          // Create stock movement on server
          const { data, error } = await supabase
            .from('stock_movements')
            .insert([movement])
            .select()
            .single();

          if (error) {
            result.errors.push(`Failed to sync stock movement: ${error.message}`);
            continue;
          }

          // Update sync status and remove from queue
          await offlineDatabase.updateSyncStatus('stock_movements', movement.id, 'synced');
          await offlineDatabase.removeFromSyncQueue(item.id);
          result.syncedItems++;

          flipperDebug.logUserAction('Stock Movement Synced', { id: movement.id });
        } catch (error) {
          result.errors.push(`Stock movement sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      result.errors.push(`Stock movements sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getSaleItems(saleId: string): Promise<any[]> {
    // This would need to be implemented in offlineDatabase
    // For now, return empty array
    return [];
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.lastSyncTime;
  }

  async setLastSyncTime(time: string): Promise<void> {
    this.lastSyncTime = time;
  }

  async forceSync(): Promise<SyncResult> {
    return this.syncPendingData({ forceSync: true });
  }

  async syncOnlyPending(): Promise<SyncResult> {
    return this.syncPendingData({ syncOnlyPending: true });
  }

  // Background sync when app comes to foreground
  async handleAppStateChange(nextAppState: string): Promise<void> {
    if (nextAppState === 'active' && this.isOnline) {
      flipperDebug.logUserAction('App Foregrounded - Starting Background Sync');
      await this.syncPendingData();
    }
  }
}

export const syncService = new SyncService();
