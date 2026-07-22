import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 pb-16 md:pb-0 transition-colors">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
