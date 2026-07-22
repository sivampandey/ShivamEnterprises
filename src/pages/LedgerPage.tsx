import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labourerApi } from '../api/labourerApi';
import { LabourerLedgerDetail, LedgerEntry } from '../api/types';
import { formatCurrency, formatDateDisplay, getTodayISO, getCurrentMonthISO, formatMonthDisplay } from '../utils/formatters';
import { exportLabourerLedgerPDF } from '../utils/exportPdf';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { InkStatusBadge } from '../components/common/InkStampBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  FileText,
  History,
  CheckCheck,
} from 'lucide-react';

export const LedgerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ledgerDetail, setLedgerDetail] = useState<LabourerLedgerDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Complete Month Salary Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState<boolean>(false);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleDate, setSettleDate] = useState<string>(getTodayISO());
  const [settleMonth, setSettleMonth] = useState<string>(getCurrentMonthISO());
  const [settleNotes, setSettleNotes] = useState<string>(`Full Salary Payout for ${formatMonthDisplay(getCurrentMonthISO())}`);
  const [isSubmittingSettle, setIsSubmittingSettle] = useState<boolean>(false);

  const fetchLedger = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await labourerApi.getLedgerDetail(id);
      setLedgerDetail(data);
      if (data.stats.balanceOwed > 0) {
        setSettleAmount(String(data.stats.balanceOwed));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load ledger detail.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Recalculate monthly earned amount when month changes in modal
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedM = e.target.value;
    setSettleMonth(selectedM);
    setSettleNotes(`Full Salary Payout for ${formatMonthDisplay(selectedM)}`);

    if (ledgerDetail) {
      // Calculate earnings for the selected month
      const monthlyEntries = ledgerDetail.entries.filter(entry => entry.date.startsWith(selectedM) && entry.type === 'ATTENDANCE');
      const monthlyEarned = monthlyEntries.reduce((acc, entry) => acc + entry.earnedAmount - entry.advanceTaken, 0);
      
      // If monthly earnings exist for this month, pre-fill with monthly earnings; otherwise use overall balance
      if (monthlyEarned > 0) {
        setSettleAmount(String(monthlyEarned));
      } else {
        setSettleAmount(String(ledgerDetail.stats.balanceOwed));
      }
    }
  };

  const handleSettlementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !settleAmount || isNaN(Number(settleAmount)) || Number(settleAmount) <= 0) {
      return;
    }

    setIsSubmittingSettle(true);
    try {
      await labourerApi.settleBalance(id, Number(settleAmount), settleNotes, settleDate);
      setIsSettleModalOpen(false);
      fetchLedger();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record salary payout.';
      setError(msg);
    } finally {
      setIsSubmittingSettle(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!ledgerDetail) return;
    exportLabourerLedgerPDF(ledgerDetail.labourer, ledgerDetail.stats, ledgerDetail.entries);
  };

  if (isLoading) return <TableSkeleton rows={8} />;
  if (error || !ledgerDetail) return <ErrorBanner message={error || 'Ledger not found.'} onRetry={fetchLedger} />;

  const { labourer, stats, entries } = ledgerDetail;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/labourers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-light dark:text-gray-400 hover:text-ink dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Labourers Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            icon={<FileText className="w-4 h-4" />}
          >
            Download PDF Ledger
          </Button>

          {/* Complete Month Salary Action Button */}
          <Button
            onClick={() => setIsSettleModalOpen(true)}
            icon={<CheckCheck className="w-4 h-4 text-emerald-100" />}
            className="bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800"
          >
            Complete Month Salary
          </Button>
        </div>
      </div>

      {/* Labourer Profile Header Card */}
      <div className="bg-paper-card dark:bg-paper-darkCard p-6 rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-ink dark:text-gray-100">
              {labourer.name}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                labourer.isActive
                  ? 'bg-emerald-100 text-status-present'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {labourer.isActive ? 'Active Worker' : 'Inactive'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-light dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-brass-500" />
              Daily Wage Rate: <strong className="font-tabular text-ink dark:text-gray-200">{formatCurrency(labourer.dailyWage)}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brass-500" />
              Joined: {formatDateDisplay(labourer.createdAt)}
            </span>
          </div>
        </div>

        {/* Net Outstanding Balance Banner */}
        <div className="p-4 rounded-xl bg-status-balanceBg dark:bg-slate-900/60 border border-status-balance/30 text-right min-w-[200px]">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-status-balance dark:text-sky-300">
            Net Balance Owed
          </span>
          <span className="text-3xl font-bold font-tabular text-status-balance dark:text-sky-200 mt-1 block">
            {formatCurrency(stats.balanceOwed)}
          </span>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Days Present"
          value={stats.daysPresent}
          subtitle="Full 8-hr shifts"
          icon={<CheckCircle2 className="w-5 h-5 text-status-present" />}
          variant="present"
        />
        <StatCard
          title="Half Days"
          value={stats.halfDays}
          subtitle="Half wage earned"
          icon={<Clock className="w-5 h-5 text-status-halfDay" />}
          variant="half"
        />
        <StatCard
          title="Days Absent"
          value={stats.daysAbsent}
          subtitle="No wage earned"
          icon={<XCircle className="w-5 h-5 text-status-absent" />}
          variant="absent"
        />
        <StatCard
          title="Total Earned"
          value={formatCurrency(stats.totalEarned)}
          subtitle={`Advances: ${formatCurrency(stats.totalAdvances)}`}
          icon={<IndianRupee className="w-5 h-5 text-brass-500" />}
        />
      </div>

      {/* Daily Ledger History Table */}
      <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger overflow-hidden">
        <div className="p-4 bg-brass-50/40 dark:bg-brass-900/10 border-b border-paper-border dark:border-paper-darkBorder flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-gray-100 flex items-center gap-2">
            <History className="w-4 h-4 text-brass-500" />
            Ledger Timeline History (Most Recent First)
          </h2>
          <span className="text-xs text-ink-light dark:text-gray-400 font-tabular font-medium">
            {entries.length} entries recorded
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-ink-light dark:text-gray-400 text-sm">
            No ledger transactions or attendance recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-paper-light dark:bg-paper-dark border-b border-paper-border dark:border-paper-darkBorder text-[11px] uppercase tracking-wider text-ink-light dark:text-gray-400 font-bold">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-4">Entry Type / Status</th>
                  <th className="py-3 px-4 text-right">Earned (₹)</th>
                  <th className="py-3 px-4 text-right">Advance (₹)</th>
                  <th className="py-3 px-4 text-right">Salary Disbursed (₹)</th>
                  <th className="py-3 px-6 text-right">Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border dark:divide-paper-darkBorder text-sm">
                {entries.map((entry: LedgerEntry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-paper-light/60 dark:hover:bg-white/5 transition-colors ${
                      entry.type === 'SETTLEMENT' ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 font-medium text-ink dark:text-gray-100">
                      {formatDateDisplay(entry.date)}
                    </td>

                    <td className="py-3.5 px-4">
                      {entry.type === 'SETTLEMENT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCheck className="w-3.5 h-3.5" />
                          SALARY PAYOUT
                        </span>
                      ) : (
                        <InkStatusBadge status={entry.status || null} />
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-tabular text-emerald-700 dark:text-emerald-400 font-semibold">
                      {entry.earnedAmount > 0 ? formatCurrency(entry.earnedAmount) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-tabular text-amber-700 dark:text-amber-400 font-semibold">
                      {entry.advanceTaken > 0 ? formatCurrency(entry.advanceTaken) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-tabular text-emerald-700 dark:text-emerald-400 font-bold">
                      {entry.amountPaid && entry.amountPaid > 0 ? formatCurrency(entry.amountPaid) : '—'}
                    </td>

                    <td className="py-3.5 px-6 text-right font-tabular font-bold text-status-balance dark:text-sky-300">
                      {formatCurrency(entry.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Month Salary Payout Modal */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        title="Complete Month Salary"
        subtitle={`Record & edit monthly salary payout for ${labourer.name}`}
      >
        <form onSubmit={handleSettlementSubmit} className="space-y-4">
          <div className="p-3 bg-brass-50 dark:bg-brass-900/30 rounded-xl border border-brass-200 dark:border-brass-800 flex items-center justify-between text-xs">
            <span className="text-brass-800 dark:text-brass-300 font-medium">Total Outstanding Balance:</span>
            <span className="font-bold font-tabular text-sm text-status-balance dark:text-sky-300">
              {formatCurrency(stats.balanceOwed)}
            </span>
          </div>

          {/* Select & Edit Salary Month */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Select Salary Month <span className="text-brass-600 dark:text-brass-400 font-normal">(Editable for any month)</span>
            </label>
            <input
              type="month"
              required
              value={settleMonth}
              onChange={handleMonthChange}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500"
            />
          </div>

          {/* Editable Payout Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Salary Amount to Disburse (₹) <span className="text-brass-600 dark:text-brass-400 font-normal">(Editable)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400">
                ₹
              </span>
              <input
                type="number"
                required
                min="1"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="Enter salary payout amount"
                className="w-full pl-8 pr-3 py-2 text-sm font-tabular font-bold text-ink dark:text-gray-100 rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark focus:ring-2 focus:ring-brass-500"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              required
              value={settleDate}
              onChange={(e) => setSettleDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500"
            />
          </div>

          {/* Editable Reference Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Notes / Reference <span className="text-brass-600 dark:text-brass-400 font-normal">(Editable)</span>
            </label>
            <input
              type="text"
              value={settleNotes}
              onChange={(e) => setSettleNotes(e.target.value)}
              placeholder="e.g. Full monthly salary cash payout"
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-paper-border dark:border-paper-darkBorder">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsSettleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingSettle}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Complete Month Salary Payout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
