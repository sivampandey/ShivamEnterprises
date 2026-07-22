import apiClient from './axios';
import { MonthlyReportSummary } from './types';
import {
  getStoredLabourers,
  getStoredAttendance,
  getStoredSettlements,
} from './mockBackend';

export const reportsApi = {
  getMonthlyReport: async (month: string): Promise<MonthlyReportSummary> => {
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        const response = await apiClient.get<MonthlyReportSummary>('/reports/monthly', {
          params: { month },
        });
        return response.data;
      }
    } catch (e) {
      // Fall through
    }

    const labourers = getStoredLabourers();
    const allAttendance = getStoredAttendance();
    const allSettlements = getStoredSettlements();

    let totalWagesPaid = 0;
    let totalAdvancesGiven = 0;

    const reportRows = labourers.map((labourer) => {
      // Filter records starting with month string "YYYY-MM"
      const monthlyAtt = allAttendance.filter(
        (a) => a.labourerId === labourer.id && a.date.startsWith(month)
      );
      const monthlySettlements = allSettlements.filter(
        (s) => s.labourerId === labourer.id && s.date.startsWith(month)
      );

      let daysPresent = 0;
      let halfDays = 0;
      let daysAbsent = 0;
      let totalEarned = 0;
      let totalAdvances = 0;

      monthlyAtt.forEach((rec) => {
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

      const totalSettled = monthlySettlements.reduce((acc, s) => acc + s.amount, 0);
      const netBalanceOwed = Math.max(0, totalEarned - totalAdvances - totalSettled);

      totalWagesPaid += totalSettled;
      totalAdvancesGiven += totalAdvances;

      return {
        labourerId: labourer.id,
        name: labourer.name,
        dailyWage: labourer.dailyWage,
        daysPresent,
        halfDays,
        daysAbsent,
        totalEarned,
        totalAdvances,
        netBalanceOwed,
      };
    });

    // Default sort: highest net balance owed first
    reportRows.sort((a, b) => b.netBalanceOwed - a.netBalanceOwed);

    const netBalanceOutstanding = reportRows.reduce((acc, r) => acc + r.netBalanceOwed, 0);

    return {
      month,
      totalWagesPaid,
      totalAdvancesGiven,
      netBalanceOutstanding,
      labourers: reportRows,
    };
  },
};
