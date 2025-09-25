export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  context?: string;
}

export class CustomError extends Error {
  public type: ErrorType;
  public code?: string;
  public details?: any;
  public context?: string;

  constructor(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any,
    context?: string
  ) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.context = context;
  }

  toAppError(): AppError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: new Date().toISOString(),
      context: this.context,
    };
  }
}

export const createError = (
  type: ErrorType,
  message: string,
  code?: string,
  details?: any,
  context?: string
): CustomError => {
  return new CustomError(type, message, code, details, context);
};

export const isNetworkError = (error: any): boolean => {
  return error?.type === ErrorType.NETWORK_ERROR ||
         error?.message?.includes('network') ||
         error?.message?.includes('fetch') ||
         error?.code === 'NETWORK_ERROR';
};

export const isAuthenticationError = (error: any): boolean => {
  return error?.type === ErrorType.AUTHENTICATION_ERROR ||
         error?.message?.includes('unauthorized') ||
         error?.message?.includes('authentication') ||
         error?.code === 'AUTH_ERROR';
};

export const isOfflineError = (error: any): boolean => {
  return error?.type === ErrorType.OFFLINE_ERROR ||
         error?.message?.includes('offline') ||
         error?.message?.includes('no internet');
};
