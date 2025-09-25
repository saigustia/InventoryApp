import { Platform } from 'react-native';

// Flipper debugging utilities
export const flipperDebug = {
  // Initialize Flipper plugins
  init: () => {
    if (__DEV__ && Platform.OS !== 'web') {
      // Initialize AsyncStorage debugging
      import('react-native-flipper-async-storage-advanced').then(({ default: AsyncStorageFlipper }) => {
        AsyncStorageFlipper();
      });
    }
  },

  // Log network requests
  logNetwork: (url: string, method: string, data?: any) => {
    if (__DEV__) {
      console.log(`🌐 ${method.toUpperCase()} ${url}`, data);
    }
  },

  // Log API responses
  logResponse: (url: string, status: number, data?: any) => {
    if (__DEV__) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} ${status} ${url}`, data);
    }
  },

  // Log errors
  logError: (error: Error, context?: string) => {
    if (__DEV__) {
      console.error(`🚨 Error${context ? ` in ${context}` : ''}:`, error);
    }
  },

  // Log performance metrics
  logPerformance: (operation: string, duration: number) => {
    if (__DEV__) {
      console.log(`⏱️ ${operation}: ${duration}ms`);
    }
  },

  // Log user actions
  logUserAction: (action: string, data?: any) => {
    if (__DEV__) {
      console.log(`👤 User Action: ${action}`, data);
    }
  },

  // Log state changes
  logStateChange: (component: string, prevState: any, newState: any) => {
    if (__DEV__) {
      console.log(`🔄 State Change in ${component}:`, { prevState, newState });
    }
  },
};
