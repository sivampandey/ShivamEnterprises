import apiClient from './axios';
import { User } from './types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    // 1. If VITE_API_BASE_URL is defined, use live Backend API
    if (import.meta.env.VITE_API_BASE_URL) {
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
        const errorMessage =
          e.response?.data?.error?.message ||
          e.response?.data?.message ||
          (e.response?.status === 401 ? 'Invalid username or password.' : 'Failed to connect to authentication server.');

        throw new Error(errorMessage);
      }
    }

    // 2. Standalone Demo / Offline Mode (only when VITE_API_BASE_URL is not set)
    await new Promise((res) => setTimeout(res, 400)); // simulate brief network delay

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
    } else {
      throw new Error('Invalid username or password.');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    if (import.meta.env.VITE_API_BASE_URL) {
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
      } catch (e) {
        localStorage.removeItem('shivam_jwt_token');
        sessionStorage.removeItem('shivam_jwt_token');
        throw new Error('Session expired or invalid token');
      }
    }

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
  },

  logout: async (): Promise<void> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('shivam_jwt_token');
    sessionStorage.removeItem('shivam_jwt_token');
  },
};
