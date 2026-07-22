import apiClient from './axios';
import { Labourer, LabourerLedgerDetail } from './types';
import {
  getStoredLabourers,
  saveStoredLabourers,
  computeLabourerLedger,
  computeLabourerBalanceOwed,
  getStoredSettlements,
  saveStoredSettlements,
  getStoredAttendance,
  saveStoredAttendance,
} from './mockBackend';
import { getTodayISO } from '../utils/formatters';

export const labourerApi = {
  getLabourers: async (includeInactive = false, search = ''): Promise<Labourer[]> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.get<Labourer[]>('/labourers', {
          params: { includeInactive, search },
        });
        return response.data;
      }
    } catch (e) {
      // Fall through to mock persistence
    }

    let labourers = getStoredLabourers();
    if (!includeInactive) {
      labourers = labourers.filter((l) => l.isActive);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      labourers = labourers.filter((l) => l.name.toLowerCase().includes(q));
    }

    // Attach current balance owed
    return labourers.map((l) => ({
      ...l,
      balanceOwed: computeLabourerBalanceOwed(l.id),
    }));
  },

  addLabourer: async (name: string, dailyWage: number): Promise<Labourer> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.post<Labourer>('/labourers', { name, dailyWage });
        return response.data;
      }
    } catch (e) {
      // Fall through
    }

    const labourers = getStoredLabourers();
    const newLabourer: Labourer = {
      id: `lab-${Date.now()}`,
      name: name.trim(),
      dailyWage: Number(dailyWage),
      isActive: true,
      createdAt: getTodayISO(),
      balanceOwed: 0,
    };
    saveStoredLabourers([newLabourer, ...labourers]);
    return newLabourer;
  },

  updateLabourer: async (id: string, updates: { name?: string; dailyWage?: number; isActive?: boolean }): Promise<Labourer> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.put<Labourer>(`/labourers/${id}`, updates);
        return response.data;
      }
    } catch (e) {
      // Fall through
    }

    const labourers = getStoredLabourers();
    const idx = labourers.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Labourer not found');

    const updated = { ...labourers[idx], ...updates };
    labourers[idx] = updated;
    saveStoredLabourers(labourers);
    return {
      ...updated,
      balanceOwed: computeLabourerBalanceOwed(id),
    };
  },

  deleteLabourer: async (id: string, permanent = false): Promise<void> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        await apiClient.delete(`/labourers/${id}`, { params: { permanent } });
        return;
      }
    } catch (e) {
      // Fall through
    }

    let labourers = getStoredLabourers();
    if (permanent) {
      labourers = labourers.filter((l) => l.id !== id);
      // Remove associated attendance and settlements
      const att = getStoredAttendance().filter((a) => a.labourerId !== id);
      saveStoredAttendance(att);
      const set = getStoredSettlements().filter((s) => s.labourerId !== id);
      saveStoredSettlements(set);
    } else {
      const idx = labourers.findIndex((l) => l.id === id);
      if (idx !== -1) {
        labourers[idx].isActive = false;
      }
    }
    saveStoredLabourers(labourers);
  },

  getLedgerDetail: async (id: string): Promise<LabourerLedgerDetail> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.get<LabourerLedgerDetail>(`/labourers/${id}/ledger`);
        return response.data;
      }
    } catch (e) {
      // Fall through
    }

    const ledger = computeLabourerLedger(id);
    if (!ledger) {
      throw new Error('Labourer not found');
    }
    return ledger;
  },

  settleBalance: async (
    labourerId: string,
    amount: number,
    notes = 'Payment / Settlement',
    date = getTodayISO()
  ): Promise<void> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        await apiClient.post(`/labourers/${labourerId}/settle`, { amount, notes, date });
        return;
      }
    } catch (e) {
      // Fall through
    }

    const settlements = getStoredSettlements();
    const newSettlement = {
      id: `set-${Date.now()}`,
      labourerId,
      date,
      amount: Number(amount),
      notes,
    };
    saveStoredSettlements([newSettlement, ...settlements]);
  },
};
