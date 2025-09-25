import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { flipperDebug } from '@/utils/debugging/flipper';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: any) => {
      const error = event.reason || event;
      flipperDebug.logError(error, 'Unhandled Promise Rejection');
      
      if (__DEV__) {
        console.error('Unhandled Promise Rejection:', error);
      } else {
        // In production, show user-friendly error
        Alert.alert(
          'Error',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    // Handle JavaScript errors
    const handleError = (event: any) => {
      const error = event.error || event;
      flipperDebug.logError(error, 'Global JavaScript Error');
      
      if (__DEV__) {
        console.error('Global JavaScript Error:', error);
      } else {
        // In production, show user-friendly error
        Alert.alert(
          'Error',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      }
    };
  }, []);

  return <>{children}</>;
};
