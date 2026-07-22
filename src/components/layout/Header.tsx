import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Store, UserCheck, Download } from 'lucide-react';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper-card/90 dark:bg-paper-darkCard/90 backdrop-blur-md border-b border-paper-border dark:border-paper-darkBorder transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brass-500 flex items-center justify-center text-white shadow-md shadow-brass-500/20 ring-2 ring-brass-500/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-ink dark:text-gray-100 tracking-wide flex items-center gap-2">
              Shivam Enterprises
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest font-semibold bg-brass-100 dark:bg-brass-900/40 text-brass-800 dark:text-brass-300 rounded border border-brass-300 dark:border-brass-700">
                Labour Ledger
              </span>
            </h1>
            <p className="text-xs text-ink-light dark:text-gray-400 font-medium hidden sm:block">
              Daily Attendance & Wage Management
            </p>
          </div>
        </div>

        {/* Action Controls & Admin Session */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install App Button */}
          {deferredPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstallClick}
              icon={<Download className="w-4 h-4 text-brass-600 dark:text-brass-400" />}
              className="hidden xs:inline-flex"
            >
              <span>Install App</span>
            </Button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-ink/70 hover:text-ink hover:bg-paper-border/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-paper-darkBorder/60 transition-all active:scale-95"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-ink" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {user && (
            <>
              {/* User Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder text-xs text-ink dark:text-gray-200">
                <UserCheck className="w-4 h-4 text-brass-500" />
                <span className="font-semibold">{user.name}</span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                icon={<LogOut className="w-4 h-4 text-status-absent" />}
                className="text-status-absent hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200"
                title="Logout"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
