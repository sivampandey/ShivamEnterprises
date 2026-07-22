import { useState, FC, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { Store, Lock, User as UserIcon, Sun, Moon, ShieldCheck, KeyRound, Key, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const LoginPage: FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot / Reset Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('admin');
  const [secretPin, setSecretPin] = useState('SHIVAM2026');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetIsLoading, setResetIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(username, password, true);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetUsername.trim()) {
      setResetError('Please enter username.');
      return;
    }
    if (!secretPin.trim()) {
      setResetError('Please enter secret key or current password.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setResetError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('New password and confirmation do not match.');
      return;
    }

    setResetIsLoading(true);
    try {
      const successMsg = await authApi.resetPassword(resetUsername, secretPin, newPassword);
      setResetSuccess(successMsg);
      setPassword(newPassword);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetSuccess(null);
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed.';
      setResetError(msg);
    } finally {
      setResetIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors relative overflow-hidden">
      {/* Top Background Decoration Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-brass-500/10 to-transparent pointer-events-none" />

      {/* Theme Toggle Button Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-paper-card dark:bg-paper-darkCard border border-paper-border dark:border-paper-darkBorder text-ink dark:text-gray-200 shadow-sm hover:scale-105 active:scale-95 transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brass-500 flex items-center justify-center text-white shadow-lg shadow-brass-500/30 ring-4 ring-brass-500/20">
            <Store className="w-7 h-7" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-serif font-bold text-ink dark:text-gray-100">
          Shivam Enterprises
        </h2>
        <p className="mt-1 text-center text-xs font-mono uppercase tracking-widest text-brass-700 dark:text-brass-400 font-semibold">
          Shop Admin Labour Attendance Ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-paper-card dark:bg-paper-darkCard py-8 px-6 sm:px-10 rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-status-absent flex items-start gap-2.5">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1.5"
              >
                Username
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-brass-600 dark:text-brass-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
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

          {/* Admin Credentials Note */}
          <div className="mt-6 pt-6 border-t border-paper-border dark:border-paper-darkBorder text-center">
            <p className="text-xs text-ink-light dark:text-gray-400">
              Default Admin Login:
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brass-50 dark:bg-brass-900/30 border border-brass-200 dark:border-brass-800 text-xs font-mono text-brass-800 dark:text-brass-300">
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>admin / {password || 'admin123'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fully Functional Password Reset Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Update Admin Password"
        subtitle="Reset or update your Shivam Enterprises login password"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-sm text-ink dark:text-gray-200">
          {resetError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-status-absent font-medium">
              {resetError}
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={resetUsername}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setResetUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Master Secret Key / Current Password
            </label>
            <input
              type="password"
              required
              value={secretPin}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSecretPin(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500"
              placeholder="SHIVAM2026 or current password"
            />
            <p className="text-[11px] text-ink-light dark:text-gray-400 mt-1">
              Default Secret Key: <span className="font-mono text-brass-700 dark:text-brass-400 font-bold">SHIVAM2026</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500"
              placeholder="Enter new password (min 4 chars)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:border-brass-500"
              placeholder="Re-enter new password"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={resetIsLoading}
              icon={<Key className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
