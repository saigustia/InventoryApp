import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncService, SyncResult } from '@/services/offline';
import { useLoadingState } from './useLoadingState';

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncResult: SyncResult | null;
  syncPendingData: () => Promise<void>;
  forceSync: () => Promise<void>;
  loadingState: ReturnType<typeof useLoadingState>;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const loadingState = useLoadingState();

  // Initialize network listener
  useEffect(() => {
    const removeListener = syncService.addNetworkListener((online) => {
      setIsOnline(online);
    });

    // Get initial sync time
    syncService.getLastSyncTime().then(setLastSyncTime);

    return removeListener;
  }, []);

  // Handle app state changes for background sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isOnline) {
        syncPendingData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isOnline]);

  const syncPendingData = useCallback(async () => {
    if (!isOnline || loadingState.isLoading) return;

    try {
      loadingState.setLoading(true);
      const result = await syncService.syncPendingData();
      setSyncResult(result);
      setLastSyncTime(result.lastSyncTime);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      loadingState.setLoading(false);
    }
  }, [isOnline, loadingState]);

  const forceSync = useCallback(async () => {
    try {
      loadingState.setLoading(true);
      const result = await syncService.forceSync();
      setSyncResult(result);
      setLastSyncTime(result.lastSyncTime);
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      loadingState.setLoading(false);
    }
  }, [loadingState]);

  return {
    isOnline,
    isSyncing: loadingState.isLoading,
    lastSyncTime,
    syncResult,
    syncPendingData,
    forceSync,
    loadingState,
  };
};
