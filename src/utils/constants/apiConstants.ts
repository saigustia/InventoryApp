export const API_CONFIG = {
  baseUrl: 'https://your-api.com/api',
  timeout: 10000,
  retryAttempts: 3,
} as const;

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    resetPassword: '/auth/reset-password',
  },
  products: {
    list: '/products',
    create: '/products',
    update: '/products/:id',
    delete: '/products/:id',
    lowStock: '/products/low-stock',
  },
  sales: {
    list: '/sales',
    create: '/sales',
    get: '/sales/:id',
    daily: '/sales/daily/:date',
    summary: '/sales/summary',
  },
  weather: {
    current: '/weather/current',
    forecast: '/weather/forecast',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;
