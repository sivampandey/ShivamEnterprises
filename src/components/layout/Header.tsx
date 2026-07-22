import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Store, UserCheck, Download, Smartphone, Laptop, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  // Detect if running inside Installed App (standalone mode)
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
  });

  useEffect(() => {
    // Check if global prompt was captured before component mount
    if ((window as unknown as Record<string, unknown>).deferredPwaPrompt) {
      setDeferredPrompt((window as unknown as Record<string, unknown>).deferredPwaPrompt as BeforeInstallPromptEvent);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const pwaEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(pwaEvent);
      (window as unknown as Record<string, unknown>).deferredPwaPrompt = pwaEvent;
    };

    const matchMedia = window.matchMedia('(display-mode: standalone)');
    const handleStandaloneChange = (e: MediaQueryListEvent) => {
      setIsAppInstalled(e.matches);
    };
    matchMedia.addEventListener('change', handleStandaloneChange);

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstalledSuccess(true);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      matchMedia.removeEventListener('change', handleStandaloneChange);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerDirectInstall = async () => {
    const prompt = deferredPrompt || ((window as unknown as Record<string, unknown>).deferredPwaPrompt as BeforeInstallPromptEvent | null);
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          (window as unknown as Record<string, unknown>).deferredPwaPrompt = null;
          setIsAppInstalled(true);
          setInstalledSuccess(true);
          setIsInstallModalOpen(false);
          return true;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
    return false;
  };

  const handleInstallClick = async () => {
    const installed = await triggerDirectInstall();
    if (!installed) {
      setIsInstallModalOpen(true);
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
          {/* Download App Button - HIDDEN IN INSTALLED APP, VISIBLE ONLY ON WEBSITE */}
          {!isAppInstalled && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              icon={<Download className="w-4 h-4 text-white" />}
              className="bg-brass-500 hover:bg-brass-600 text-white font-bold shadow-sm animate-pulse hover:animate-none"
              title="Download App on Device"
            >
              <span>Download App</span>
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

      {/* Success Notification Banner */}
      {installedSuccess && (
        <div className="bg-emerald-600 text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-inner">
          <CheckCircle2 className="w-4 h-4" />
          <span>App installed successfully on your device home screen!</span>
          <button onClick={() => setInstalledSuccess(false)} className="underline ml-4 text-white/80 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Download & Install App Modal */}
      <Modal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        title="Install Shivam Ledger App"
        subtitle="Install as a standalone application on phone or computer"
      >
        <div className="space-y-4 text-sm text-ink dark:text-gray-200">
          {/* Primary Direct Action Button inside Modal */}
          <div className="p-4 rounded-xl bg-brass-50 dark:bg-brass-950/40 border border-brass-200 dark:border-brass-800 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 font-bold text-brass-800 dark:text-brass-300 text-base">
              <Sparkles className="w-5 h-5 text-brass-500" />
              <span>Direct 1-Click Install</span>
            </div>
            <p className="text-xs text-ink-light dark:text-gray-300">
              Click below to launch Chrome / Edge native installation prompt on your device.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={triggerDirectInstall}
              icon={<Download className="w-4 h-4" />}
              className="w-full bg-brass-500 hover:bg-brass-600 text-white font-bold py-3 shadow-md"
            >
              Install App Directly Now
            </Button>
          </div>

          {/* Device Quick Guides */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink/70 dark:text-gray-400">
              If Install Popup Does Not Appear Automatically:
            </h4>

            {/* Android Section */}
            <div className="p-3 rounded-xl bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder space-y-1">
              <div className="flex items-center gap-2 font-semibold text-brass-700 dark:text-brass-400 text-xs">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Android Chrome / Brave / Edge</span>
              </div>
              <p className="text-xs text-ink-light dark:text-gray-400 leading-relaxed pl-6">
                Tap Chrome top <strong>⋮ (3 dots)</strong> &rarr; Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>

            {/* iPhone Section */}
            <div className="p-3 rounded-xl bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder space-y-1">
              <div className="flex items-center gap-2 font-semibold text-brass-700 dark:text-brass-400 text-xs">
                <Share2 className="w-4 h-4 shrink-0" />
                <span>iPhone / iPad (Safari)</span>
              </div>
              <p className="text-xs text-ink-light dark:text-gray-400 leading-relaxed pl-6">
                Tap Safari bottom <strong>Share button</strong> &rarr; Tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-brass-600" /> &rarr; Tap <strong>Add</strong>.
              </p>
            </div>

            {/* Desktop Section */}
            <div className="p-3 rounded-xl bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder space-y-1">
              <div className="flex items-center gap-2 font-semibold text-brass-700 dark:text-brass-400 text-xs">
                <Laptop className="w-4 h-4 shrink-0" />
                <span>Laptop / Desktop (Chrome, Edge, Brave)</span>
              </div>
              <p className="text-xs text-ink-light dark:text-gray-400 leading-relaxed pl-6">
                Click the <strong>Install icon ⊕</strong> in your browser address bar top right.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setIsInstallModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
