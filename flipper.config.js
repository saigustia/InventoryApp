module.exports = {
  // Flipper configuration for React Native debugging
  plugins: [
    // AsyncStorage plugin for debugging storage
    'react-native-flipper-async-storage-advanced',
    
    // Network plugin for API debugging
    'flipper-plugin-network',
    
    // Layout plugin for UI debugging
    'flipper-plugin-layout',
    
    // Database plugin for Supabase debugging
    'flipper-plugin-database',
  ],
  
  // Configure Flipper for development
  enabled: __DEV__,
  
  // Custom Flipper plugins directory
  pluginsDir: './flipper-plugins',
  
  // Network debugging configuration
  network: {
    enabled: true,
    logLevel: 'debug',
  },
  
  // Layout debugging configuration
  layout: {
    enabled: true,
    showInspector: true,
  },
  
  // Database debugging configuration
  database: {
    enabled: true,
    showQueries: true,
    showMutations: true,
  },
};
