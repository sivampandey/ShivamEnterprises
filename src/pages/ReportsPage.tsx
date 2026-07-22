import { useState, useEffect, useCallback, FC, useMemo, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reportsApi';
import { MonthlyReportSummary } from '../api/types';
import { getCurrentMonthISO, formatMonthDisplay, formatCurrency } from '../utils/formatters';
import { exportMonthlyReportPDF } from '../utils/exportPdf';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  Calendar,
  FileText,
  IndianRupee,
  ArrowUpDown,
  BookOpen,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const ReportsPage: FC = () => {
  const [month, setMonth] = useState<string>(getCurrentMonthISO());
  const [report, setReport] = useState<MonthlyReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<'netBalanceOwed' | 'totalEarned' | 'totalAdvances'>('netBalanceOwed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getMonthlyReport(month);
      setReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate monthly ledger report.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportPDF = () => {
    if (!report) return;
    exportMonthlyReportPDF(report.month, report, report.labourers);
  };

  const handleSort = (field: 'netBalanceOwed' | 'totalEarned' | 'totalAdvances') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedLabourers = report
    ? [...report.labourers].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border dark:border-paper-darkBorder">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            Monthly Wage Ledger Reports
          </h1>
          <p className="text-xs sm:text-sm text-ink-light dark:text-gray-400">
            Summarizes monthly wage payouts, cash advances, and individual worker balance tallies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Picker */}
          <div className="flex items-center gap-2 bg-paper-card dark:bg-paper-darkCard px-3 py-2 rounded-xl border border-paper-border dark:border-paper-darkBorder shadow-sm">
            <Calendar className="w-4 h-4 text-brass-500 shrink-0" />
            <input
              type="month"
              value={month}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-ink dark:text-gray-100 focus:outline-none cursor-pointer"
            />
          </div>

          {/* PDF Download Button */}
          <Button
            onClick={handleExportPDF}
            variant="primary"
            icon={<FileText className="w-4 h-4" />}
            disabled={!report || report.labourers.length === 0}
          >
            Download PDF Report
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchReport} />}

      {/* Report Content */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : !report ? null : (
        <>
          {/* Month Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Wages Paid Out"
              value={formatCurrency(report.totalWagesPaid)}
              subtitle={`Settlements in ${formatMonthDisplay(report.month)}`}
              icon={<TrendingUp className="w-5 h-5 text-status-present" />}
              variant="present"
            />
            <StatCard
              title="Total Cash Advances Issued"
              value={formatCurrency(report.totalAdvancesGiven)}
              subtitle={`In ${formatMonthDisplay(report.month)}`}
              icon={<TrendingDown className="w-5 h-5 text-status-halfDay" />}
              variant="half"
            />
            <StatCard
              title="Net Outstanding Balances"
              value={formatCurrency(report.netBalanceOutstanding)}
              subtitle="Total owed across active workers"
              icon={<IndianRupee className="w-5 h-5 text-status-balance" />}
              variant="navy"
            />
          </div>

          {/* Labourers Monthly Tally Table */}
          <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger overflow-hidden">
            <div className="p-4 bg-brass-50/50 dark:bg-brass-900/10 border-b border-paper-border dark:border-paper-darkBorder flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-gray-100">
                Worker Breakdown ({formatMonthDisplay(report.month)})
              </h2>
              <span className="text-xs text-ink-light dark:text-gray-400 font-medium">
                Click column headers to sort
              </span>
            </div>

            {sortedLabourers.length === 0 ? (
              <div className="text-center py-12 text-ink-light dark:text-gray-400 text-sm">
                No attendance or wage activity recorded for this month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-light dark:bg-paper-dark border-b border-paper-border dark:border-paper-darkBorder text-[11px] uppercase tracking-wider text-ink-light dark:text-gray-400 font-bold">
                      <th className="py-3 px-6">Labourer Name</th>
                      <th className="py-3 px-4 text-right">Daily Wage (₹)</th>
                      <th className="py-3 px-4 text-center">Days Present</th>
                      <th className="py-3 px-4 text-center">Half Days</th>
                      <th className="py-3 px-4 text-center">Days Absent</th>
                      <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-ink" onClick={() => handleSort('totalEarned')}>
                        <div className="inline-flex items-center justify-end gap-1">
                          <span>Total Earned (₹)</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-ink" onClick={() => handleSort('totalAdvances')}>
                        <div className="inline-flex items-center justify-end gap-1">
                          <span>Advances (₹)</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-6 text-right cursor-pointer select-none hover:text-ink" onClick={() => handleSort('netBalanceOwed')}>
                        <div className="inline-flex items-center justify-end gap-1">
                          <span>Net Balance Owed (₹)</span>
                          <ArrowUpDown className="w-3 h-3 text-brass-500" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-border dark:divide-paper-darkBorder text-sm">
                    {sortedLabourers.map((row) => (
                      <tr
                        key={row.labourerId}
                        className="hover:bg-paper-light/60 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3.5 px-6 font-semibold text-ink dark:text-gray-100">
                          <Link
                            to={`/labourers/${row.labourerId}/ledger`}
                            className="hover:text-brass-600 dark:hover:text-brass-400 hover:underline inline-flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-brass-500" />
                            <span>{row.name}</span>
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-right font-tabular text-ink-light dark:text-gray-300">
                          {formatCurrency(row.dailyWage)}
                        </td>

                        <td className="py-3.5 px-4 text-center font-tabular font-semibold text-status-present">
                          {row.daysPresent}
                        </td>

                        <td className="py-3.5 px-4 text-center font-tabular font-semibold text-status-halfDay">
                          {row.halfDays}
                        </td>

                        <td className="py-3.5 px-4 text-center font-tabular text-status-absent">
                          {row.daysAbsent}
                        </td>

                        <td className="py-3.5 px-4 text-right font-tabular font-semibold text-ink dark:text-gray-200">
                          {formatCurrency(row.totalEarned)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-tabular font-semibold text-amber-700 dark:text-amber-400">
                          {formatCurrency(row.totalAdvances)}
                        </td>

                        <td className="py-3.5 px-6 text-right font-tabular font-bold text-status-balance dark:text-sky-300">
                          {formatCurrency(row.netBalanceOwed)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
