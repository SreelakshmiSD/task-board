import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
export const API_CONFIG = {
  // Use local Next.js API routes as proxy to avoid CORS issues
  BASE_URL: '/api',
  TIMEOUT: 30000, // Increased to 30 seconds
  RETRY_ATTEMPTS: 2, // Reduced retry attempts to fail faster
  RETRY_DELAY: 1000,
};

// Create axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add CORS configuration
  withCredentials: false
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add user ID to headers if available
      const userId = localStorage.getItem('userId');
      if (userId) {
        config.headers['X-User-ID'] = userId;
      }
    }
    
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('API Request Failed:', {
        status: error.response?.status,
        url: error.config?.url?.replace(API_CONFIG.BASE_URL, ''),
        message: error.message
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Optionally redirect to login
      }
    }

    return Promise.reject(error);
  }
);

// Auth utilities
export const authUtils = {
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  setUserId: (userId: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
  },

  getUserId: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || 'default_user';
    }
    return 'default_user';
  },

  removeUserId: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  },

  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
  }
};

// Error handling utilities
export const errorUtils = {
  isNetworkError: (error: AxiosError): boolean => {
    return !error.response && !!error.request;
  },
  
  isServerError: (error: AxiosError): boolean => {
    return !!error.response && error.response.status >= 500;
  },
  
  isClientError: (error: AxiosError): boolean => {
    return !!error.response && error.response.status >= 400 && error.response.status < 500;
  },
  
  getErrorMessage: (error: AxiosError): string => {
    const data = error.response?.data as any;
    if (data?.message) {
      return data.message;
    }
    if (data?.detail) {
      return data.detail;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
};

// Retry utility
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (errorUtils.isClientError(error as AxiosError)) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

export default axiosInstance;
