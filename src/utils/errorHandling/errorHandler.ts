import { Alert } from 'react-native';
import { flipperDebug } from '../debugging/flipper';
import { ErrorType, CustomError, AppError, createError } from './errorTypes';

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  context?: string;
  fallbackMessage?: string;
}

class ErrorHandler {
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  handleError(
    error: any,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const {
      showAlert = true,
      logError = true,
      context,
      fallbackMessage = 'An unexpected error occurred. Please try again.'
    } = options;

    let appError: AppError;

    if (error instanceof CustomError) {
      appError = error.toAppError();
    } else {
      appError = this.normalizeError(error, context);
    }

    // Log error
    if (logError) {
      this.logError(appError);
      flipperDebug.logError(error, context || 'Error Handler');
    }

    // Show alert to user
    if (showAlert) {
      this.showErrorAlert(appError);
    }

    return appError;
  }

  private normalizeError(error: any, context?: string): AppError {
    let type = ErrorType.UNKNOWN_ERROR;
    let message = 'An unexpected error occurred';
    let code: string | undefined;
    let details: any = undefined;

    // Determine error type and message
    if (this.isNetworkError(error)) {
      type = ErrorType.NETWORK_ERROR;
      message = 'Network connection failed. Please check your internet connection.';
      code = 'NETWORK_ERROR';
    } else if (this.isAuthenticationError(error)) {
      type = ErrorType.AUTHENTICATION_ERROR;
      message = 'Authentication failed. Please sign in again.';
      code = 'AUTH_ERROR';
    } else if (this.isValidationError(error)) {
      type = ErrorType.VALIDATION_ERROR;
      message = error.message || 'Please check your input and try again.';
      code = 'VALIDATION_ERROR';
    } else if (this.isPermissionError(error)) {
      type = ErrorType.PERMISSION_ERROR;
      message = 'You do not have permission to perform this action.';
      code = 'PERMISSION_ERROR';
    } else if (this.isNotFoundError(error)) {
      type = ErrorType.NOT_FOUND_ERROR;
      message = 'The requested resource was not found.';
      code = 'NOT_FOUND_ERROR';
    } else if (this.isServerError(error)) {
      type = ErrorType.SERVER_ERROR;
      message = 'Server error occurred. Please try again later.';
      code = 'SERVER_ERROR';
    } else if (this.isOfflineError(error)) {
      type = ErrorType.OFFLINE_ERROR;
      message = 'You are currently offline. Changes will be synced when you reconnect.';
      code = 'OFFLINE_ERROR';
    } else if (error?.message) {
      message = error.message;
    }

    // Extract additional details
    if (error?.response?.data) {
      details = error.response.data;
    } else if (error?.details) {
      details = error.details;
    }

    return {
      type,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private isNetworkError(error: any): boolean {
    return (
      error?.message?.includes('network') ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('connection') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.name === 'NetworkError'
    );
  }

  private isAuthenticationError(error: any): boolean {
    return (
      error?.message?.includes('unauthorized') ||
      error?.message?.includes('authentication') ||
      error?.message?.includes('login') ||
      error?.status === 401 ||
      error?.code === 'AUTH_ERROR'
    );
  }

  private isValidationError(error: any): boolean {
    return (
      error?.message?.includes('validation') ||
      error?.message?.includes('invalid') ||
      error?.status === 400 ||
      error?.code === 'VALIDATION_ERROR'
    );
  }

  private isPermissionError(error: any): boolean {
    return (
      error?.message?.includes('permission') ||
      error?.message?.includes('forbidden') ||
      error?.status === 403 ||
      error?.code === 'PERMISSION_ERROR'
    );
  }

  private isNotFoundError(error: any): boolean {
    return (
      error?.message?.includes('not found') ||
      error?.status === 404 ||
      error?.code === 'NOT_FOUND_ERROR'
    );
  }

  private isServerError(error: any): boolean {
    return (
      error?.status >= 500 ||
      error?.code === 'SERVER_ERROR' ||
      error?.message?.includes('server error')
    );
  }

  private isOfflineError(error: any): boolean {
    return (
      error?.message?.includes('offline') ||
      error?.message?.includes('no internet') ||
      error?.code === 'OFFLINE_ERROR'
    );
  }

  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  private showErrorAlert(error: AppError): void {
    const title = this.getErrorTitle(error.type);
    const message = error.message;

    Alert.alert(title, message, [
      {
        text: 'OK',
        style: 'default',
      },
    ]);
  }

  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
        return 'Connection Error';
      case ErrorType.AUTHENTICATION_ERROR:
        return 'Authentication Error';
      case ErrorType.VALIDATION_ERROR:
        return 'Validation Error';
      case ErrorType.PERMISSION_ERROR:
        return 'Permission Error';
      case ErrorType.NOT_FOUND_ERROR:
        return 'Not Found';
      case ErrorType.SERVER_ERROR:
        return 'Server Error';
      case ErrorType.OFFLINE_ERROR:
        return 'Offline Mode';
      case ErrorType.SYNC_ERROR:
        return 'Sync Error';
      default:
        return 'Error';
    }
  }

  // Public methods for specific error handling
  handleNetworkError(error: any, context?: string): AppError {
    return this.handleError(
      createError(ErrorType.NETWORK_ERROR, 'Network connection failed', 'NETWORK_ERROR', error, context),
      { showAlert: true, logError: true, context }
    );
  }

  handleAuthenticationError(error: any, context?: string): AppError {
    return this.handleError(
      createError(ErrorType.AUTHENTICATION_ERROR, 'Authentication failed', 'AUTH_ERROR', error, context),
      { showAlert: true, logError: true, context }
    );
  }

  handleValidationError(message: string, details?: any, context?: string): AppError {
    return this.handleError(
      createError(ErrorType.VALIDATION_ERROR, message, 'VALIDATION_ERROR', details, context),
      { showAlert: true, logError: true, context }
    );
  }

  handleOfflineError(context?: string): AppError {
    return this.handleError(
      createError(ErrorType.OFFLINE_ERROR, 'You are currently offline', 'OFFLINE_ERROR', null, context),
      { showAlert: false, logError: true, context }
    );
  }

  handleSyncError(error: any, context?: string): AppError {
    return this.handleError(
      createError(ErrorType.SYNC_ERROR, 'Data sync failed', 'SYNC_ERROR', error, context),
      { showAlert: true, logError: true, context }
    );
  }

  // Utility methods
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getLastError(): AppError | null {
    return this.errorLog.length > 0 ? this.errorLog[0] : null;
  }

  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  getErrorsByContext(context: string): AppError[] {
    return this.errorLog.filter(error => error.context === context);
  }
}

export const errorHandler = new ErrorHandler();
