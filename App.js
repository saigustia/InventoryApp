import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { DefaultTheme } from 'react-native-paper';
import { AppNavigator } from '@/navigation';
import { ErrorBoundary, GlobalErrorHandler } from '@/components';
import { flipperDebug } from '@/utils/debugging/flipper';

// Initialize debugging tools
flipperDebug.init();

// Custom theme
const theme = {
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
  },
  roundness: 8,
};

export default function App() {
  return (
    <GlobalErrorHandler>
      <ErrorBoundary>
        <PaperProvider theme={theme}>
          <AppNavigator />
        </PaperProvider>
      </ErrorBoundary>
    </GlobalErrorHandler>
  );
}
