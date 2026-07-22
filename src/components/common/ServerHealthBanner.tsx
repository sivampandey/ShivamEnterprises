import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import { WifiOff, RefreshCw } from 'lucide-react';

export const ServerHealthBanner: React.FC = () => {
  const [isServerDown, setIsServerDown] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const response = await apiClient.get('/health');
      if (response.status === 200 && response.data?.status === 'ok') {
        setIsServerDown(false);
      } else {
        setIsServerDown(true);
      }
    } catch (error) {
      setIsServerDown(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();

    // Periodic check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isServerDown) return null;

  return (
    <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium z-50 sticky top-0 transition-all">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
          <span>
            <strong>Cannot reach server</strong> — Please ensure backend server is running and API base URL is configured.
          </span>
        </div>
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="ml-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Retry'}</span>
        </button>
      </div>
    </div>
  );
};
