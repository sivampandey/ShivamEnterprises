import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarCheck, Users, BarChart3 } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: "Today's Register",
      icon: CalendarCheck,
    },
    {
      to: '/labourers',
      label: 'Labourers',
      icon: Users,
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Sub-Header */}
      <nav className="hidden md:block bg-paper-light dark:bg-paper-dark border-b border-paper-border dark:border-paper-darkBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 py-3.5 px-1 border-b-2 font-medium text-sm transition-all ${
                      isActive
                        ? 'border-brass-500 text-brass-700 dark:text-brass-400 font-semibold'
                        : 'border-transparent text-ink-light dark:text-gray-400 hover:text-ink dark:hover:text-gray-200 hover:border-gray-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-card/95 dark:bg-paper-darkCard/95 backdrop-blur-md border-t border-paper-border dark:border-paper-darkBorder px-2 py-1 shadow-lg">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brass-50 dark:bg-brass-900/40 text-brass-700 dark:text-brass-400 font-semibold'
                      : 'text-ink-light dark:text-gray-400 hover:text-ink dark:hover:text-gray-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
