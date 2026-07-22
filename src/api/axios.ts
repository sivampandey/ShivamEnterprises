import axios from 'axios';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl && envUrl.trim()) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = `${cleanUrl}/api`;
    }
    return cleanUrl;
  }

  // Dynamic host resolution for multi-device support (mobiles, tablets, LAN)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (
      import.meta.env.DEV ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return `http://${hostname}:5000/api`;
    }
  }

  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shivam_jwt_token') || sessionStorage.getItem('shivam_jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Normalize Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('shivam_jwt_token');
        sessionStorage.removeItem('shivam_jwt_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Filter out raw Vercel HTML/JSON "The page could not be found" messages
      if (
        error.response.data &&
        (error.response.data.message === 'The page could not be found' ||
          typeof error.response.data === 'string' && error.response.data.includes('The page could not be found'))
      ) {
        error.message = 'Unable to connect to backend server. Please check server connection.';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
