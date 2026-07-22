import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-200">
        <Loader2 className="w-8 h-8 text-brass-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-ink-light dark:text-gray-400">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
