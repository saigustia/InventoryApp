export const APP_CONFIG = {
  name: 'Ice Cream Inventory App',
  version: '1.0.0',
  description: 'Comprehensive inventory management for ice cream businesses',
} as const;

export const COLORS = {
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
  // Ice cream theme colors
  iceCream: {
    vanilla: '#FFF8DC',
    chocolate: '#8B4513',
    strawberry: '#FFB6C1',
    mint: '#98FB98',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
  },
} as const;

export const SIZES = {
  // Touch targets
  minTouchTarget: 44,
  buttonHeight: 48,
  inputHeight: 56,
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Border radius
  borderRadius: 8,
  borderRadiusLarge: 16,
} as const;

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
  },
} as const;
