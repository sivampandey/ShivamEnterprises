import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../api/types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on application mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('shivam_jwt_token') || sessionStorage.getItem('shivam_jwt_token');
        if (token) {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        localStorage.removeItem('shivam_jwt_token');
        sessionStorage.removeItem('shivam_jwt_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(username, password);
      if (rememberMe) {
        localStorage.setItem('shivam_jwt_token', res.token);
      } else {
        sessionStorage.setItem('shivam_jwt_token', res.token);
      }
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
