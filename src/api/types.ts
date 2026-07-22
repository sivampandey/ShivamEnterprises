export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | null;

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'SHOP_OWNER';
}

export interface Labourer {
  id: string;
  name: string;
  dailyWage: number;
  isActive: boolean;
  createdAt: string;
  balanceOwed?: number;
}

export interface AttendanceRecord {
  id: string;
  labourerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  advanceTaken: number;
  earnedAmount: number;
}

export interface LedgerEntry {
  id: string;
  labourerId: string;
  date: string;
  type: 'ATTENDANCE' | 'SETTLEMENT';
  status?: AttendanceStatus;
  earnedAmount: number;
  advanceTaken: number;
  amountPaid?: number; // for settlement
  runningBalance: number;
  notes?: string;
}

export interface LabourerLedgerDetail {
  labourer: Labourer;
  stats: {
    daysPresent: number;
    halfDays: number;
    daysAbsent: number;
    totalEarned: number;
    totalAdvances: number;
    totalSettled: number;
    balanceOwed: number;
  };
  entries: LedgerEntry[];
}

export interface MonthlyReportSummary {
  month: string; // YYYY-MM
  totalWagesPaid: number;
  totalAdvancesGiven: number;
  netBalanceOutstanding: number;
  labourers: {
    labourerId: string;
    name: string;
    dailyWage: number;
    daysPresent: number;
    halfDays: number;
    daysAbsent: number;
    totalEarned: number;
    totalAdvances: number;
    netBalanceOwed: number;
  }[];
}
