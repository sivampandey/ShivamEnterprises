import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Store, UserCheck, Download, Smartphone, Laptop, Share2, PlusSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

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
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        // Fallback to instruction modal
      }
    }
    // Show instruction modal if prompt not available or on iOS/Safari
    setIsInstallModalOpen(true);
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
          {/* ALWAYS VISIBLE Download / Install App Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleInstallClick}
            icon={<Download className="w-4 h-4 text-white" />}
            className="bg-brass-500 hover:bg-brass-600 text-white font-bold shadow-sm"
            title="Download App on Device"
          >
            <span>Download App</span>
          </Button>

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

      {/* Download & Install App Guide Modal */}
      <Modal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        title="Download App on Your Device"
        subtitle="Install Shivam Ledger directly on your phone or laptop"
      >
        <div className="space-y-4 text-sm text-ink dark:text-gray-200">
          {/* Android Section */}
          <div className="p-3.5 rounded-xl bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-brass-700 dark:text-brass-400">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>Android Mobile / Tablet (Chrome)</span>
            </div>
            <p className="text-xs text-ink-light dark:text-gray-400 leading-relaxed pl-6">
              1. Tap Chrome top menu <strong>⋮ (3 dots)</strong>.<br />
              2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
              3. App icon will appear on your phone home screen!
            </p>
          </div>

          {/* iPhone Section */}
          <div className="p-3.5 rounded-xl bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-brass-700 dark:text-brass-400">
              <Share2 className="w-4 h-4 shrink-0" />
              <span>iPhone / iPad (Safari)</span>
            </div>
            <p className="text-xs text-ink-light dark:text-gray-400 leading-relaxed pl-6">
              1. Tap Safari bottom <strong>Share button</strong> (Square with arrow).<br />
              2. Tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-brass-600" />.<br />
              3. Tap <strong>Add</strong> in the top right corner.
            </p>
          </div>

          {/* Desktop Section */}
          <div className="p-3.5 rounded-xl bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-brass-700 dark:text-brass-400">
              <Laptop className="w-4 h-4 shrink-0" />
              <span>Windows PC / Mac (Chrome or Edge)</span>
            </div>
            <p className="text-xs text-ink-light dark:text-gray-400 leading-relaxed pl-6">
              Click the <strong>Install icon</strong> in your browser address bar (top right) or menu to install as a desktop app.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setIsInstallModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
