import { Labourer, AttendanceRecord, LedgerEntry } from './types';
import { getTodayISO } from '../utils/formatters';

const STORAGE_KEYS = {
  LABOURERS: 'shivam_labourers_v1',
  ATTENDANCE: 'shivam_attendance_v1',
  SETTLEMENTS: 'shivam_settlements_v1',
};

// Initial Seed Data for Shivam Enterprises Shop
const INITIAL_LABOURERS: Labourer[] = [
  { id: 'lab-1', name: 'Ramesh Kumar', dailyWage: 650, isActive: true, createdAt: '2026-01-10' },
  { id: 'lab-2', name: 'Suresh Verma', dailyWage: 700, isActive: true, createdAt: '2026-01-15' },
  { id: 'lab-3', name: 'Amit Sharma', dailyWage: 600, isActive: true, createdAt: '2026-02-01' },
  { id: 'lab-4', name: 'Vikram Singh', dailyWage: 800, isActive: true, createdAt: '2026-02-12' },
  { id: 'lab-5', name: 'Pankaj Yadav', dailyWage: 550, isActive: true, createdAt: '2026-03-05' },
  { id: 'lab-6', name: 'Dinesh Prasad (Inactive)', dailyWage: 600, isActive: false, createdAt: '2025-11-20' },
];

const today = getTodayISO();

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's entries
  { id: 'att-101', labourerId: 'lab-1', date: today, status: 'PRESENT', advanceTaken: 100, earnedAmount: 650 },
  { id: 'att-102', labourerId: 'lab-2', date: today, status: 'HALF_DAY', advanceTaken: 0, earnedAmount: 350 },
  { id: 'att-103', labourerId: 'lab-3', date: today, status: 'ABSENT', advanceTaken: 0, earnedAmount: 0 },
  { id: 'att-104', labourerId: 'lab-4', date: today, status: 'PRESENT', advanceTaken: 200, earnedAmount: 800 },

  // Yesterday & past days sample entries
  { id: 'att-1', labourerId: 'lab-1', date: '2026-07-20', status: 'PRESENT', advanceTaken: 200, earnedAmount: 650 },
  { id: 'att-2', labourerId: 'lab-1', date: '2026-07-21', status: 'PRESENT', advanceTaken: 0, earnedAmount: 650 },
  { id: 'att-3', labourerId: 'lab-2', date: '2026-07-20', status: 'PRESENT', advanceTaken: 100, earnedAmount: 700 },
  { id: 'att-4', labourerId: 'lab-2', date: '2026-07-21', status: 'HALF_DAY', advanceTaken: 50, earnedAmount: 350 },
  { id: 'att-5', labourerId: 'lab-3', date: '2026-07-20', status: 'PRESENT', advanceTaken: 0, earnedAmount: 600 },
  { id: 'att-6', labourerId: 'lab-4', date: '2026-07-20', status: 'PRESENT', advanceTaken: 0, earnedAmount: 800 },
  { id: 'att-7', labourerId: 'lab-4', date: '2026-07-21', status: 'PRESENT', advanceTaken: 300, earnedAmount: 800 },
];

export interface SettlementRecord {
  id: string;
  labourerId: string;
  date: string;
  amount: number;
  notes?: string;
}

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  { id: 'set-1', labourerId: 'lab-1', date: '2026-07-15', amount: 3000, notes: 'Mid-month cash settlement' },
];

// Helper functions for mock storage
export const getStoredLabourers = (): Labourer[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LABOURERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.LABOURERS, JSON.stringify(INITIAL_LABOURERS));
    return INITIAL_LABOURERS;
  }
  return JSON.parse(data);
};

export const saveStoredLabourers = (labourers: Labourer[]) => {
  localStorage.setItem(STORAGE_KEYS.LABOURERS, JSON.stringify(labourers));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    return INITIAL_ATTENDANCE;
  }
  return JSON.parse(data);
};

export const saveStoredAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const getStoredSettlements = (): SettlementRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
    return INITIAL_SETTLEMENTS;
  }
  return JSON.parse(data);
};

export const saveStoredSettlements = (settlements: SettlementRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
};

// Calculate running balance & stats for a labourer
export const computeLabourerLedger = (labourerId: string) => {
  const labourers = getStoredLabourers();
  const labourer = labourers.find((l) => l.id === labourerId);
  if (!labourer) return null;

  const attendance = getStoredAttendance().filter((a) => a.labourerId === labourerId);
  const settlements = getStoredSettlements().filter((s) => s.labourerId === labourerId);

  let daysPresent = 0;
  let halfDays = 0;
  let daysAbsent = 0;
  let totalEarned = 0;
  let totalAdvances = 0;

  attendance.forEach((rec) => {
    if (rec.status === 'PRESENT') {
      daysPresent++;
      totalEarned += labourer.dailyWage;
    } else if (rec.status === 'HALF_DAY') {
      halfDays++;
      totalEarned += labourer.dailyWage / 2;
    } else if (rec.status === 'ABSENT') {
      daysAbsent++;
    }
    totalAdvances += rec.advanceTaken || 0;
  });

  const totalSettled = settlements.reduce((acc, s) => acc + s.amount, 0);
  const balanceOwed = Math.max(0, totalEarned - totalAdvances - totalSettled);

  // Combine attendance & settlements into ordered timeline (oldest first for running balance computation)
  interface CombinedRaw {
    id: string;
    labourerId: string;
    date: string;
    type: 'ATTENDANCE' | 'SETTLEMENT';
    status?: any;
    earnedAmount: number;
    advanceTaken: number;
    amountPaid?: number;
    notes?: string;
  }

  const combined: CombinedRaw[] = [
    ...attendance.map((a) => ({
      id: a.id,
      labourerId: a.labourerId,
      date: a.date,
      type: 'ATTENDANCE' as const,
      status: a.status,
      earnedAmount:
        a.status === 'PRESENT'
          ? labourer.dailyWage
          : a.status === 'HALF_DAY'
          ? labourer.dailyWage / 2
          : 0,
      advanceTaken: a.advanceTaken || 0,
    })),
    ...settlements.map((s) => ({
      id: s.id,
      labourerId: s.labourerId,
      date: s.date,
      type: 'SETTLEMENT' as const,
      earnedAmount: 0,
      advanceTaken: 0,
      amountPaid: s.amount,
      notes: s.notes || 'Settlement Payment',
    })),
  ];

  // Sort ascending by date
  combined.sort((a, b) => a.date.localeCompare(b.date));

  let currentRunBalance = 0;
  const entriesWithBalance: LedgerEntry[] = combined.map((entry) => {
    if (entry.type === 'ATTENDANCE') {
      currentRunBalance += entry.earnedAmount - entry.advanceTaken;
    } else if (entry.type === 'SETTLEMENT') {
      currentRunBalance -= entry.amountPaid || 0;
    }

    return {
      id: entry.id,
      labourerId: entry.labourerId,
      date: entry.date,
      type: entry.type,
      status: entry.status,
      earnedAmount: entry.earnedAmount,
      advanceTaken: entry.advanceTaken,
      amountPaid: entry.amountPaid,
      runningBalance: Math.max(0, currentRunBalance),
      notes: entry.notes,
    };
  });

  // Return most recent first
  entriesWithBalance.reverse();

  return {
    labourer,
    stats: {
      daysPresent,
      halfDays,
      daysAbsent,
      totalEarned,
      totalAdvances,
      totalSettled,
      balanceOwed,
    },
    entries: entriesWithBalance,
  };
};

export const computeLabourerBalanceOwed = (labourerId: string): number => {
  const ledger = computeLabourerLedger(labourerId);
  return ledger ? ledger.stats.balanceOwed : 0;
};
