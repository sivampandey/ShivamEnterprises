import apiClient from './axios';
import { User } from './types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<any>('/auth/login', {
        username,
        password,
      });

      const data = response.data;
      return {
        token: data.token,
        user: data.user || {
          id: data.admin?.id || 'usr-1',
          username: data.admin?.username || username,
          name: 'Shivam Shop Admin',
          role: 'ADMIN',
        },
      };
    } catch (e: any) {
      if (e.response?.status === 404) {
        throw new Error(
          'Backend API endpoint not found (404). Please set VITE_API_BASE_URL in Vercel to your Render URL (e.g. https://your-backend.onrender.com/api).'
        );
      }
      const errorMessage =
        e.response?.data?.error?.message ||
        (typeof e.response?.data?.message === 'string' && e.response.data.message !== 'The page could not be found'
          ? e.response.data.message
          : null) ||
        (e.response?.status === 401 ? 'Invalid username or password.' : 'Failed to connect to authentication server.');
      throw new Error(errorMessage);
    }
  },
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<any>('/auth/me');
      const data = response.data;
      return (
        data.user || {
          id: data.admin?.id || 'usr-1',
          username: data.admin?.username || 'admin',
          name: 'Shivam Shop Admin',
          role: 'ADMIN',
        }
      );
    } catch (e: any) {
      if (e.response && e.response.status === 401) {
        localStorage.removeItem('shivam_jwt_token');
        sessionStorage.removeItem('shivam_jwt_token');
        throw new Error('Session expired or invalid token');
      }

      // Fallback for standalone offline session check
      const token = localStorage.getItem('shivam_jwt_token') || sessionStorage.getItem('shivam_jwt_token');
      if (!token) {
        throw new Error('No active session token');
      }

      return {
        id: 'usr-1',
        username: 'admin',
        name: 'Shivam Shop Admin',
        role: 'ADMIN',
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore logout network errors
    }
    localStorage.removeItem('shivam_jwt_token');
    sessionStorage.removeItem('shivam_jwt_token');
  },
};
