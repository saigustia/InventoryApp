import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976D2',
    primaryContainer: '#BBDEFB',
    secondary: '#FF6B35',
    secondaryContainer: '#FFE0B2',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#D32F2F',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#212121',
    onBackground: '#212121',
    outline: '#BDBDBD',
    // Custom colors for ice cream theme
    iceCream: {
      vanilla: '#FFF8DC',
      chocolate: '#8B4513',
      strawberry: '#FFB6C1',
      mint: '#98FB98',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
    }
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    headlineLarge: {
      ...DefaultTheme.fonts.headlineLarge,
      fontSize: 24,
      fontWeight: 'bold',
    },
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontSize: 20,
      fontWeight: '600',
    },
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontSize: 16,
    },
  },
};
