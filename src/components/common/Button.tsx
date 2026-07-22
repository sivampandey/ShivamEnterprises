import * as React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variantStyles = {
    primary:
      'bg-brass-500 hover:bg-brass-600 text-white shadow-sm focus:ring-brass-500 dark:bg-brass-500 dark:hover:bg-brass-400',
    secondary:
      'bg-paper-border hover:bg-gray-300 text-ink dark:bg-paper-darkBorder dark:hover:bg-gray-700 dark:text-gray-200 focus:ring-gray-400',
    danger:
      'bg-status-absent hover:bg-red-800 text-white shadow-sm focus:ring-red-600',
    outline:
      'border-2 border-brass-500 text-brass-700 hover:bg-brass-50 dark:text-brass-400 dark:hover:bg-gray-800 focus:ring-brass-500',
    ghost:
      'text-ink hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10 focus:ring-gray-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
