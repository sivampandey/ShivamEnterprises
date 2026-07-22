import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'present' | 'half' | 'absent' | 'navy';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default:
      'bg-paper-card dark:bg-paper-darkCard border-paper-border dark:border-paper-darkBorder text-ink dark:text-gray-100',
    present:
      'bg-status-presentBg dark:bg-emerald-950/40 border-status-present/40 text-status-present dark:text-emerald-300',
    half:
      'bg-status-halfDayBg dark:bg-amber-950/40 border-status-halfDay/40 text-status-halfDay dark:text-amber-300',
    absent:
      'bg-status-absentBg dark:bg-rose-950/40 border-status-absent/40 text-status-absent dark:text-rose-300',
    navy:
      'bg-status-balanceBg dark:bg-slate-900/60 border-status-balance/40 text-status-balance dark:text-sky-300',
  };

  return (
    <div
      className={`p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-light dark:text-gray-400">
          {title}
        </span>
        {icon && <div className="p-2 rounded-lg bg-black/5 dark:bg-white/10">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-bold font-tabular tracking-tight">
        {value}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-ink-light dark:text-gray-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
