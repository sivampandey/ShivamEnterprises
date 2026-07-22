import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi, RegisterItem } from '../api/attendanceApi';
import { AttendanceStatus } from '../api/types';
import { getTodayISO, formatDateDisplay, formatCurrency } from '../utils/formatters';
import { InkStampGroup } from '../components/common/InkStampBadge';
import { StatCard } from '../components/common/StatCard';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Calendar, UserPlus, CheckCircle, IndianRupee, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const DashboardPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [registerItems, setRegisterItems] = useState<RegisterItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const todayISO = getTodayISO();

  const fetchRegister = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getRegisterForDate(selectedDate);
      setRegisterItems(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attendance register.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchRegister();
  }, [fetchRegister]);

  const handleStatusChange = async (labourerId: string, newStatus: AttendanceStatus) => {
    const currentItem = registerItems.find((item) => item.labourer.id === labourerId);
    if (!currentItem) return;

    const advanceTaken = currentItem.advanceTaken;

    // Optimistic UI Update
    setRegisterItems((prev) =>
      prev.map((item) => {
        if (item.labourer.id === labourerId) {
          let earnedAmount = 0;
          if (newStatus === 'PRESENT') earnedAmount = item.labourer.dailyWage;
          else if (newStatus === 'HALF_DAY') earnedAmount = item.labourer.dailyWage / 2;
          return { ...item, status: newStatus, earnedAmount };
        }
        return item;
      })
    );

    setUpdatingIds((prev) => ({ ...prev, [labourerId]: true }));
    try {
      await attendanceApi.updateAttendance(labourerId, selectedDate, newStatus, advanceTaken);
    } catch (err) {
      // Rollback on failure
      fetchRegister();
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [labourerId]: false }));
    }
  };

  const handleAdvanceChange = async (labourerId: string, newAdvance: number) => {
    const currentItem = registerItems.find((item) => item.labourer.id === labourerId);
    if (!currentItem) return;

    const val = Math.max(0, isNaN(newAdvance) ? 0 : newAdvance);

    // Optimistic UI update
    setRegisterItems((prev) =>
      prev.map((item) => {
        if (item.labourer.id === labourerId) {
          return { ...item, advanceTaken: val };
        }
        return item;
      })
    );

    setUpdatingIds((prev) => ({ ...prev, [labourerId]: true }));
    try {
      await attendanceApi.updateAttendance(labourerId, selectedDate, currentItem.status, val);
    } catch (err) {
      fetchRegister();
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [labourerId]: false }));
    }
  };

  // Stats computation
  const totalEarnedToday = registerItems.reduce((acc, item) => acc + item.earnedAmount, 0);
  const totalAdvancesToday = registerItems.reduce((acc, item) => acc + item.advanceTaken, 0);
  const presentCount = registerItems.filter((i) => i.status === 'PRESENT').length;
  const halfDayCount = registerItems.filter((i) => i.status === 'HALF_DAY').length;
  const absentCount = registerItems.filter((i) => i.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Page Title & Date Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border dark:border-paper-darkBorder">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            Daily Attendance Register
          </h1>
          <p className="text-xs sm:text-sm text-ink-light dark:text-gray-400">
            Select a date to mark attendance stamps and record cash advances taken today.
          </p>
        </div>

        {/* Date Selector Picker */}
        <div className="flex items-center gap-2 bg-paper-card dark:bg-paper-darkCard px-3 py-2 rounded-xl border border-paper-border dark:border-paper-darkBorder shadow-sm">
          <Calendar className="w-4 h-4 text-brass-500 shrink-0" />
          <input
            type="date"
            max={todayISO}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm font-semibold text-ink dark:text-gray-100 focus:outline-none cursor-pointer"
          />
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-brass-100 dark:bg-brass-900/40 text-brass-800 dark:text-brass-300 font-bold">
            {formatDateDisplay(selectedDate)}
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Wages Earned"
          value={formatCurrency(totalEarnedToday)}
          subtitle={`${registerItems.length} active labourers`}
          icon={<IndianRupee className="w-5 h-5 text-brass-500" />}
        />
        <StatCard
          title="Advances Given"
          value={formatCurrency(totalAdvancesToday)}
          subtitle="Issued today"
          icon={<IndianRupee className="w-5 h-5 text-status-halfDay" />}
          variant="half"
        />
        <StatCard
          title="Present (Full/Half)"
          value={`${presentCount} / ${halfDayCount}`}
          subtitle={`${absentCount} absent today`}
          icon={<CheckCircle className="w-5 h-5 text-status-present" />}
          variant="present"
        />
        <StatCard
          title="Net Payout Due"
          value={formatCurrency(Math.max(0, totalEarnedToday - totalAdvancesToday))}
          subtitle="For this date"
          icon={<IndianRupee className="w-5 h-5 text-status-balance" />}
          variant="navy"
        />
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={fetchRegister} />}

      {/* Register List / Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : registerItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-paper-card dark:bg-paper-darkCard rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-brass-100 dark:bg-brass-900/30 text-brass-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-ink dark:text-gray-100">
              No Labourers Registered Yet
            </h3>
            <p className="text-xs sm:text-sm text-ink-light dark:text-gray-400 max-w-md mx-auto mt-1">
              Your attendance register is empty. Add active labourers to your shop to begin marking daily attendance and advances.
            </p>
          </div>
          <Link to="/labourers" className="inline-block">
            <Button icon={<UserPlus className="w-4 h-4" />}>Add Labourers Now</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brass-50/60 dark:bg-brass-900/10 border-b border-paper-border dark:border-paper-darkBorder text-xs uppercase tracking-wider text-ink-light dark:text-gray-400 font-bold">
                  <th className="py-3.5 px-6">Labourer Name</th>
                  <th className="py-3.5 px-4 text-right">Daily Wage (₹)</th>
                  <th className="py-3.5 px-6 text-center">Attendance Stamp</th>
                  <th className="py-3.5 px-4 text-right">Advance Taken (₹)</th>
                  <th className="py-3.5 px-6 text-right">Amount Earned (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border dark:divide-paper-darkBorder text-sm">
                {registerItems.map((item) => (
                  <tr
                    key={item.labourer.id}
                    className="hover:bg-paper-light/60 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-ink dark:text-gray-100">
                      <Link
                        to={`/labourers/${item.labourer.id}/ledger`}
                        className="hover:text-brass-600 dark:hover:text-brass-400 hover:underline flex items-center gap-2"
                      >
                        <span>{item.labourer.name}</span>
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-right font-tabular text-ink-light dark:text-gray-300">
                      {formatCurrency(item.labourer.dailyWage)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <InkStampGroup
                        status={item.status}
                        onChange={(newStatus) => handleStatusChange(item.labourer.id, newStatus)}
                        disabled={updatingIds[item.labourer.id]}
                      />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center justify-end max-w-[120px]">
                        <span className="text-gray-400 mr-1 font-mono">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={item.advanceTaken || ''}
                          onChange={(e) =>
                            handleAdvanceChange(item.labourer.id, parseFloat(e.target.value))
                          }
                          className="w-24 text-right font-tabular px-2.5 py-1 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark focus:ring-2 focus:ring-brass-500 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right font-tabular font-bold text-ink dark:text-gray-100">
                      {formatCurrency(item.earnedAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-paper-border dark:divide-paper-darkBorder">
            {registerItems.map((item) => (
              <div key={item.labourer.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/labourers/${item.labourer.id}/ledger`}
                    className="font-bold text-base text-ink dark:text-gray-100 hover:text-brass-600"
                  >
                    {item.labourer.name}
                  </Link>
                  <span className="text-xs font-tabular font-semibold text-ink-light dark:text-gray-400 bg-paper-light dark:bg-paper-dark px-2 py-1 rounded border border-paper-border dark:border-paper-darkBorder">
                    Wage: {formatCurrency(item.labourer.dailyWage)}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-light dark:text-gray-400 mb-1.5">
                    Attendance Stamp
                  </span>
                  <InkStampGroup
                    status={item.status}
                    onChange={(newStatus) => handleStatusChange(item.labourer.id, newStatus)}
                    disabled={updatingIds[item.labourer.id]}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-paper-border dark:border-paper-darkBorder text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-light dark:text-gray-400">
                      Advance Taken Today
                    </label>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="font-mono text-gray-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={item.advanceTaken || ''}
                        onChange={(e) =>
                          handleAdvanceChange(item.labourer.id, parseFloat(e.target.value))
                        }
                        className="w-24 text-right font-tabular px-2 py-1 rounded border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark focus:ring-2 focus:ring-brass-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-light dark:text-gray-400">
                      Earned Today
                    </span>
                    <span className="text-base font-bold font-tabular text-brass-600 dark:text-brass-400 mt-1 block">
                      {formatCurrency(item.earnedAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
