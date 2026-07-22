import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Store, Lock, User as UserIcon, Sun, Moon, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(username, password, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid username or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-paper-light dark:bg-paper-dark transition-colors relative overflow-hidden">
      {/* Background Decorative Ledger Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#B9812E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-paper-card dark:bg-paper-darkCard border border-paper-border dark:border-paper-darkBorder text-ink dark:text-gray-200 shadow-sm hover:scale-105 transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Shop Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brass-500 flex items-center justify-center text-white shadow-xl shadow-brass-500/25 ring-4 ring-brass-500/20 mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink dark:text-gray-100">
            Shivam Enterprises
          </h2>
          <p className="mt-1 text-sm text-ink-light dark:text-gray-400 font-medium">
            Labour Attendance & Wage Ledger Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-paper-card dark:bg-paper-darkCard py-8 px-6 sm:px-10 rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-status-absent dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1.5"
              >
                Username or Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-ink/80 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brass-500 focus:ring-brass-500 border-paper-border dark:border-gray-700 bg-paper-light dark:bg-paper-dark"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="font-medium text-brass-600 dark:text-brass-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              Sign In to Register
            </Button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-6 border-t border-paper-border dark:border-paper-darkBorder text-center">
            <p className="text-xs text-ink-light dark:text-gray-400">
              Demo Admin Access Credentials:
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brass-50 dark:bg-brass-900/30 border border-brass-200 dark:border-brass-800 text-xs font-mono text-brass-800 dark:text-brass-300">
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>admin / admin123</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Stub Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        subtitle="Admin password recovery"
      >
        <div className="space-y-4 text-sm text-ink/80 dark:text-gray-300">
          <p>
            Please contact the system administrator or check your shop configuration file to reset your security credentials.
          </p>
          <div className="p-3 bg-brass-50 dark:bg-brass-900/30 rounded-lg text-xs font-mono text-brass-800 dark:text-brass-300">
            Support Hotline: +91 98765 43210 (Shivam Enterprises)
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setIsForgotModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
