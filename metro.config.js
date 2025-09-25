const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript and custom extensions
config.resolver.sourceExts.push('ts', 'tsx');

// Configure path aliases for better imports
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/components': path.resolve(__dirname, 'src/components'),
  '@/screens': path.resolve(__dirname, 'src/screens'),
  '@/services': path.resolve(__dirname, 'src/services'),
  '@/utils': path.resolve(__dirname, 'src/utils'),
  '@/navigation': path.resolve(__dirname, 'src/navigation'),
  '@/assets': path.resolve(__dirname, 'src/assets'),
  '@/types': path.resolve(__dirname, 'src/utils/types'),
};

// Optimize for large projects
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable tree shaking
config.transformer.enableBabelRCLookup = false;

// Configure for better performance
config.cacheStores = [
  {
    name: 'filesystem',
    path: path.resolve(__dirname, '.metro-cache'),
  },
];

module.exports = config;
