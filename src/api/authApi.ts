import apiClient from './axios';
import { User } from './types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.post<LoginResponse>('/auth/login', { username, password });
        return response.data;
      }
    } catch (e) {
      console.warn('Backend API unavailable, using local authentication verification');
    }

    // Mock Login handling for demo / standalone testing
    await new Promise((res) => setTimeout(res, 400)); // simulate brief network delay

    if (username.trim() && password.trim()) {
      const mockToken = 'mock_jwt_token_shivam_admin_2026';
      const mockUser: User = {
        id: 'usr-1',
        username: username || 'admin',
        name: 'Shivam Shop Admin',
        role: 'ADMIN',
      };
      return { token: mockToken, user: mockUser };
    } else {
      throw new Error('Please enter both username and password.');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
      }
    } catch (e) {
      // Fallback
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
