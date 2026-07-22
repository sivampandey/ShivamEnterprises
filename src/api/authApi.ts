import apiClient from './axios';
import { User } from './types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<any>('/auth/login', { username, password });
      const data = response.data;

      const user: User = data.user || {
        id: data.admin?.id || 'usr-1',
        username: data.admin?.username || username,
        name: 'Shivam Shop Admin',
        role: 'ADMIN',
      };

      return {
        token: data.token,
        user,
      };
    } catch (e: any) {
      // Backend API returned an error (e.g. 401 Invalid Credentials or 400 Validation Error)
      if (e.response) {
        const errorMessage =
          e.response.data?.error?.message ||
          e.response.data?.message ||
          (e.response.status === 401 ? 'Invalid username or password.' : 'Failed to connect to authentication server.');
        throw new Error(errorMessage);
      }

      // If backend network request failed completely (e.g. server is down / offline)
      // Fallback for standalone local demo testing ONLY if credentials match admin/admin123
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
        const mockToken = 'mock_jwt_token_shivam_admin_2026';
        const mockUser: User = {
          id: 'usr-1',
          username: 'admin',
          name: 'Shivam Shop Admin',
          role: 'ADMIN',
        };
        return { token: mockToken, user: mockUser };
      }

      throw new Error(e.message || 'Unable to connect to backend server. Please check server connection.');
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
