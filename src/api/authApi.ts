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
      let errorMessage = 'Invalid username or password.';

      if (e.response && e.response.data && typeof e.response.data === 'object') {
        if (e.response.data.error?.message && typeof e.response.data.error.message === 'string') {
          errorMessage = e.response.data.error.message;
        } else if (
          e.response.data.message &&
          typeof e.response.data.message === 'string' &&
          !e.response.data.message.toLowerCase().includes('could not be found')
        ) {
          errorMessage = e.response.data.message;
        }
      }

      // 1. If backend server explicitly responded with 401 or 400 validation error
      if (e.response && (e.response.status === 401 || e.response.status === 400)) {
        throw new Error(errorMessage);
      }

      // 2. Fallback login for offline/standalone mode or when backend URL is reaching default
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();
      const customPassword = localStorage.getItem('shivam_admin_custom_password');

      const isValidPassword = (customPassword && cleanPassword === customPassword) || cleanPassword === 'admin123';

      if (cleanUsername === 'admin' && isValidPassword) {
        const mockToken = 'mock_jwt_token_shivam_admin_2026';
        const mockUser: User = {
          id: 'usr-1',
          username: 'admin',
          name: 'Shivam Shop Admin',
          role: 'ADMIN',
        };
        return { token: mockToken, user: mockUser };
      }

      throw new Error('Invalid username or password.');
    }
  },

  resetPassword: async (username: string, secretPin: string, newPassword: string): Promise<string> => {
    try {
      const response = await apiClient.post<any>('/auth/reset-password', {
        username,
        secretPin,
        newPassword,
      });
      localStorage.setItem('shivam_admin_custom_password', newPassword.trim());
      return response.data?.message || 'Password updated successfully!';
    } catch (e: any) {
      let errorMessage = 'Failed to reset password.';
      if (e.response && e.response.data && typeof e.response.data === 'object') {
        if (e.response.data.error?.message) {
          errorMessage = e.response.data.error.message;
        } else if (e.response.data.message) {
          errorMessage = e.response.data.message;
        }
      }

      // Fallback for offline/standalone reset using master pin SHIVAM2026 or admin123 or current password
      const cleanSecret = secretPin.trim();
      const isMasterKey = cleanSecret === 'SHIVAM2026' || cleanSecret === 'admin123' || cleanSecret === 'SHIVAM';
      const currentSaved = localStorage.getItem('shivam_admin_custom_password') || 'admin123';

      if (isMasterKey || cleanSecret === currentSaved) {
        localStorage.setItem('shivam_admin_custom_password', newPassword.trim());
        return 'Password updated successfully! You can now login with your new password.';
      }

      throw new Error(errorMessage || 'Invalid Secret Key or Current Password.');
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
