import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { Settlement } from '../models/Settlement.js';

/**
 * Server-side business logic calculation:
 * - present: 100% dailyWage
 * - half: 50% dailyWage
 * - absent: 0
 * Running balance = Total Earned - Total Withdrawals - Total Settlements
 */
export const calculateLabourerBalance = async (labourerId, dailyWage) => {
  const attendanceRecords = await AttendanceRecord.find({ labourerId });
  const settlements = await Settlement.find({ labourerId });

  let daysPresent = 0;
  let halfDays = 0;
  let daysAbsent = 0;
  let totalEarned = 0;
  let totalWithdrawals = 0;

  attendanceRecords.forEach((record) => {
    if (record.status === 'present') {
      daysPresent++;
      totalEarned += dailyWage;
    } else if (record.status === 'half') {
      halfDays++;
      totalEarned += dailyWage / 2;
    } else if (record.status === 'absent') {
      daysAbsent++;
    }
    totalWithdrawals += record.withdrawal || 0;
  });

  const totalSettled = settlements.reduce((acc, s) => acc + (s.amountSettled || 0), 0);
  const balance = Math.max(0, totalEarned - totalWithdrawals - totalSettled);

  return {
    daysPresent,
    halfDays,
    daysAbsent,
    totalEarned,
    totalWithdrawals,
    totalSettled,
    balance,
  };
};
