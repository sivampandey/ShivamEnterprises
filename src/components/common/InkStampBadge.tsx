import * as React from 'react';
import { AttendanceStatus } from '../../api/types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface InkStampGroupProps {
  status: AttendanceStatus;
  onChange: (newStatus: AttendanceStatus) => void;
  disabled?: boolean;
}

export const InkStampGroup: React.FC<InkStampGroupProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const handleToggle = (target: 'PRESENT' | 'HALF_DAY' | 'ABSENT') => {
    if (disabled) return;
    if (status === target) {
      onChange(null); // Click active again to clear
    } else {
      onChange(target);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-paper-light dark:bg-paper-dark border border-paper-border dark:border-paper-darkBorder rounded-lg shadow-inner">
      {/* Present Stamp */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleToggle('PRESENT')}
        title="Mark Present (Full Day)"
        className={`stamp-btn stamp-btn-present flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all border ${
          status === 'PRESENT'
            ? 'active'
            : 'bg-white dark:bg-paper-darkCard border-gray-200 dark:border-gray-700 text-status-present hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Present</span>
      </button>

      {/* Half Day Stamp */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleToggle('HALF_DAY')}
        title="Mark Half Day"
        className={`stamp-btn stamp-btn-half flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all border ${
          status === 'HALF_DAY'
            ? 'active'
            : 'bg-white dark:bg-paper-darkCard border-gray-200 dark:border-gray-700 text-status-halfDay hover:bg-amber-50 dark:hover:bg-amber-950/30'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Half Day</span>
      </button>

      {/* Absent Stamp */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleToggle('ABSENT')}
        title="Mark Absent"
        className={`stamp-btn stamp-btn-absent flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all border ${
          status === 'ABSENT'
            ? 'active'
            : 'bg-white dark:bg-paper-darkCard border-gray-200 dark:border-gray-700 text-status-absent hover:bg-rose-50 dark:hover:bg-rose-950/30'
        }`}
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Absent</span>
      </button>
    </div>
  );
};

export const InkStatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
        Not Marked
      </span>
    );
  }

  const badgeConfig = {
    PRESENT: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-status-present dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      label: 'PRESENT',
    },
    HALF_DAY: {
      bg: 'bg-amber-100 dark:bg-amber-950/60 text-status-halfDay dark:text-amber-300 border-amber-300 dark:border-amber-800',
      label: 'HALF DAY',
    },
    ABSENT: {
      bg: 'bg-rose-100 dark:bg-rose-950/60 text-status-absent dark:text-rose-300 border-rose-300 dark:border-rose-800',
      label: 'ABSENT',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border font-mono tracking-wider ${badgeConfig.bg}`}
    >
      {badgeConfig.label}
    </span>
  );
};
