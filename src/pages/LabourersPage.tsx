import { useState, useEffect, useCallback, FC, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { labourerApi } from '../api/labourerApi';
import { Labourer } from '../api/types';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  UserPlus,
  Search,
  BookOpen,
  UserX,
  Trash2,
  Check,
  Edit2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LabourersPage: FC = () => {
  const navigate = useNavigate();
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [includeInactive, setIncludeInactive] = useState<boolean>(false);

  // Add Labourer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newWage, setNewWage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Inline wage editing state
  const [editingWageId, setEditingWageId] = useState<string | null>(null);
  const [editingWageVal, setEditingWageVal] = useState<string>('');

  // Confirmation dialog states
  const [deactivateTarget, setDeactivateTarget] = useState<Labourer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Labourer | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchLabourers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await labourerApi.getLabourers(includeInactive, search);
      setLabourers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load labourers roster.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive, search]);

  useEffect(() => {
    fetchLabourers();
  }, [fetchLabourers]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newWage || isNaN(Number(newWage))) {
      setAddError('Please enter a valid labourer name and daily wage.');
      return;
    }

    setAddError(null);
    setIsSaving(true);
    try {
      await labourerApi.addLabourer(newName.trim(), Number(newWage));
      setIsAddModalOpen(false);
      setNewName('');
      setNewWage('');
      fetchLabourers();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add new labourer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineWageSave = async (id: string) => {
    const val = Number(editingWageVal);
    if (isNaN(val) || val <= 0) {
      setEditingWageId(null);
      return;
    }
    try {
      await labourerApi.updateLabourer(id, { dailyWage: val });
      fetchLabourers();
    } catch (err) {
      console.error(err);
    } finally {
      setEditingWageId(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setIsActionLoading(true);
    try {
      await labourerApi.updateLabourer(deactivateTarget.id, {
        isActive: !deactivateTarget.isActive,
      });
      setDeactivateTarget(null);
      fetchLabourers();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeletePermanent = async () => {
    if (!deleteTarget) return;
    setIsActionLoading(true);
    try {
      await labourerApi.deleteLabourer(deleteTarget.id, true);
      setDeleteTarget(null);
      fetchLabourers();
    } catch (err: any) {
      setError(err.message || 'Permanent deletion failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border dark:border-paper-darkBorder">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            Labourers Roster & Directory
          </h1>
          <p className="text-xs sm:text-sm text-ink-light dark:text-gray-400">
            Manage daily wages, active status, and view running balances owed to shop workers.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={<UserPlus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add New Labourer
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-paper-card dark:bg-paper-darkCard p-4 rounded-xl border border-paper-border dark:border-paper-darkBorder shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search by labourer name..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:outline-none"
          />
        </div>

        {/* Show/Hide Inactive Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-ink-light dark:text-gray-300 cursor-pointer select-none px-2 py-1.5 rounded-lg hover:bg-paper-light dark:hover:bg-paper-dark transition-colors">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 rounded text-brass-500 focus:ring-brass-500 border-paper-border dark:border-gray-700 bg-paper-light dark:bg-paper-dark"
          />
          {includeInactive ? <Eye className="w-4 h-4 text-brass-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          <span>Show Deactivated / Removed Labourers</span>
        </label>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchLabourers} />}

      {/* Labourers Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : labourers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-paper-card dark:bg-paper-darkCard rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-sm space-y-3">
          <p className="text-ink-light dark:text-gray-400 text-sm">
            No labourers match your current search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-paper-card dark:bg-paper-darkCard rounded-2xl border border-paper-border dark:border-paper-darkBorder shadow-ledger overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brass-50/60 dark:bg-brass-900/10 border-b border-paper-border dark:border-paper-darkBorder text-xs uppercase tracking-wider text-ink-light dark:text-gray-400 font-bold">
                  <th className="py-3.5 px-6">Labourer Name</th>
                  <th className="py-3.5 px-4 text-right">Daily Wage (₹)</th>
                  <th className="py-3.5 px-6 text-right">Current Balance Owed</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border dark:divide-paper-darkBorder text-sm">
                {labourers.map((labourer) => (
                  <tr
                    key={labourer.id}
                    className={`hover:bg-paper-light/60 dark:hover:bg-white/5 transition-colors ${
                      !labourer.isActive ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/30' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-4 px-6 font-semibold text-ink dark:text-gray-100">
                      <button
                        onClick={() => navigate(`/labourers/${labourer.id}/ledger`)}
                        className="hover:text-brass-600 dark:hover:text-brass-400 hover:underline flex items-center gap-2 text-left"
                      >
                        <BookOpen className="w-4 h-4 text-brass-500 shrink-0" />
                        <span>{labourer.name}</span>
                      </button>
                    </td>

                    {/* Inline Editable Daily Wage */}
                    <td className="py-4 px-4 text-right font-tabular">
                      {editingWageId === labourer.id ? (
                        <div className="inline-flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={editingWageVal}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingWageVal(e.target.value)}
                            className="w-20 px-2 py-1 text-right text-xs rounded border border-brass-500 focus:outline-none bg-paper-light dark:bg-paper-dark"
                            autoFocus
                          />
                          <button
                            onClick={() => handleInlineWageSave(labourer.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingWageId(labourer.id);
                            setEditingWageVal(String(labourer.dailyWage));
                          }}
                          className="inline-flex items-center gap-1.5 hover:text-brass-600 group text-ink-light dark:text-gray-200"
                          title="Click to edit wage"
                        >
                          <span className="font-semibold">{formatCurrency(labourer.dailyWage)}</span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brass-500 transition-opacity" />
                        </button>
                      )}
                    </td>

                    {/* Balance Owed */}
                    <td className="py-4 px-6 text-right font-tabular font-bold text-status-balance dark:text-sky-300">
                      {formatCurrency(labourer.balanceOwed || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          labourer.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-status-present dark:text-emerald-300 border border-emerald-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-300'
                        }`}
                      >
                        {labourer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Row Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/labourers/${labourer.id}/ledger`)}
                          icon={<BookOpen className="w-3.5 h-3.5 text-brass-600" />}
                          title="Open Ledger Detail"
                        >
                          Ledger
                        </Button>

                        {/* Soft Deactivate / Reactivate */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeactivateTarget(labourer)}
                          icon={<UserX className="w-3.5 h-3.5 text-amber-600" />}
                          title={labourer.isActive ? 'Deactivate Labourer' : 'Reactivate Labourer'}
                        >
                          {labourer.isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>

                        {/* Hard Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTarget(labourer)}
                          icon={<Trash2 className="w-3.5 h-3.5 text-status-absent" />}
                          className="text-status-absent hover:bg-rose-50"
                          title="Delete Permanently"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-paper-border dark:divide-paper-darkBorder">
            {labourers.map((labourer) => (
              <div key={labourer.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/labourers/${labourer.id}/ledger`)}
                      className="font-bold text-base text-ink dark:text-gray-100 hover:text-brass-600 text-left"
                    >
                      {labourer.name}
                    </button>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        labourer.isActive
                          ? 'bg-emerald-100 text-status-present'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {labourer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-ink-light dark:text-gray-400">Daily Wage:</span>
                    <span className="font-bold font-tabular ml-1 text-ink dark:text-gray-200">
                      {formatCurrency(labourer.dailyWage)}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-light dark:text-gray-400">Balance Owed:</span>
                    <span className="font-bold font-tabular ml-1 text-status-balance dark:text-sky-300">
                      {formatCurrency(labourer.balanceOwed || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-paper-border dark:border-paper-darkBorder">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/labourers/${labourer.id}/ledger`)}
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                  >
                    Ledger
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeactivateTarget(labourer)}
                  >
                    {labourer.isActive ? 'Deactivate' : 'Reactivate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(labourer)}
                    className="text-status-absent"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Labourer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Labourer"
        subtitle="Register a new shop worker in the ledger"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {addError && (
            <div className="p-3 rounded-lg bg-rose-50 text-status-absent text-xs font-medium">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Labourer Full Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 dark:text-gray-300 mb-1">
              Daily Wage Rate (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400">
                ₹
              </span>
              <input
                type="number"
                required
                min="100"
                step="50"
                value={newWage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWage(e.target.value)}
                placeholder="650"
                className="w-full pl-8 pr-3 py-2 text-sm font-tabular rounded-lg border border-paper-border dark:border-paper-darkBorder bg-paper-light dark:bg-paper-dark text-ink dark:text-gray-100 focus:ring-2 focus:ring-brass-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-paper-border dark:border-paper-darkBorder">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving}>
              Save Labourer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Soft Deactivation */}
      {deactivateTarget && (
        <ConfirmDialog
          isOpen={!!deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleDeactivate}
          title={deactivateTarget.isActive ? 'Deactivate Labourer' : 'Reactivate Labourer'}
          message={`Are you sure you want to ${
            deactivateTarget.isActive ? 'deactivate' : 'reactivate'
          } ${deactivateTarget.name}? Deactivated labourers will be hidden from daily attendance registers.`}
          confirmText={deactivateTarget.isActive ? 'Deactivate' : 'Reactivate'}
          variant={deactivateTarget.isActive ? 'warning' : 'primary'}
          isLoading={isActionLoading}
        />
      )}

      {/* Confirmation Dialog for Permanent Hard Deletion */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeletePermanent}
          title="Delete Labourer Permanently"
          message={`Are you sure you want to PERMANENTLY delete ${deleteTarget.name}? This will permanently remove their attendance records and ledger history. This action cannot be undone.`}
          confirmText="Permanently Delete"
          variant="danger"
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
};
