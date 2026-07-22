import { z } from 'zod';
import { Labourer } from '../models/Labourer.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { Settlement } from '../models/Settlement.js';
import { calculateLabourerBalance } from '../utils/balanceCalculator.js';
import { generateMonthlyReportCSV } from '../utils/csvExporter.js';

const settleSchema = z.object({
  amount: z.number().positive('Settlement amount must be greater than zero'),
  note: z.string().optional(),
  date: z.string().optional(),
});

export const getLabourerLedger = async (req, res, next) => {
  try {
    const { id } = req.params;
    const labourer = await Labourer.findById(id);
    if (!labourer) {
      return res.status(404).json({
        error: {
          message: 'Labourer not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const attendanceRecords = await AttendanceRecord.find({ labourerId: id });
    const settlements = await Settlement.find({ labourerId: id });

    const stats = await calculateLabourerBalance(id, labourer.dailyWage);

    // Combine attendance and settlements into timeline sorted by date ascending
    const combined = [
      ...attendanceRecords.map((a) => {
        let earned = 0;
        if (a.status === 'present') earned = labourer.dailyWage;
        else if (a.status === 'half') earned = labourer.dailyWage / 2;

        return {
          id: a._id,
          date: a.date,
          type: 'ATTENDANCE',
          status: a.status ? a.status.toUpperCase() : null,
          earnedAmount: earned,
          advanceTaken: a.withdrawal || 0,
          amountPaid: 0,
        };
      }),
      ...settlements.map((s) => ({
        id: s._id,
        date: s.date,
        type: 'SETTLEMENT',
        earnedAmount: 0,
        advanceTaken: 0,
        amountPaid: s.amountSettled,
        note: s.note,
      })),
    ];

    combined.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate running balance
    let runningBalance = 0;
    const entries = combined.map((entry) => {
      if (entry.type === 'ATTENDANCE') {
        runningBalance += entry.earnedAmount - entry.advanceTaken;
      } else if (entry.type === 'SETTLEMENT') {
        runningBalance -= entry.amountPaid;
      }

      return {
        ...entry,
        runningBalance: Math.max(0, runningBalance),
      };
    });

    // Return most recent first
    entries.reverse();

    return res.status(200).json({
      labourer: {
        id: labourer._id,
        _id: labourer._id,
        name: labourer.name,
        dailyWage: labourer.dailyWage,
        active: labourer.active,
        isActive: labourer.active,
        joinedDate: labourer.joinedDate,
        createdAt: labourer.createdAt,
      },
      stats: {
        daysPresent: stats.daysPresent,
        halfDays: stats.halfDays,
        daysAbsent: stats.daysAbsent,
        totalEarned: stats.totalEarned,
        totalAdvances: stats.totalWithdrawals,
        totalSettled: stats.totalSettled,
        balanceOwed: stats.balance,
      },
      entries,
    });
  } catch (error) {
    next(error);
  }
};

export const recordSettlement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = settleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: parseResult.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const labourer = await Labourer.findById(id);
    if (!labourer) {
      return res.status(404).json({
        error: {
          message: 'Labourer not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const { amount, note, date } = parseResult.data;
    const settlementDate = date || new Date().toISOString().split('T')[0];

    const settlement = await Settlement.create({
      labourerId: id,
      date: settlementDate,
      amountSettled: amount,
      note: note || 'Cash settlement payment',
    });

    const updatedStats = await calculateLabourerBalance(id, labourer.dailyWage);

    return res.status(201).json({
      success: true,
      settlement: {
        id: settlement._id,
        labourerId: settlement.labourerId,
        date: settlement.date,
        amountSettled: settlement.amountSettled,
        note: settlement.note,
      },
      newBalance: updatedStats.balance,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlySummary = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({
        error: {
          message: 'Query parameter month (YYYY-MM) is required',
          code: 'MISSING_MONTH',
        },
      });
    }

    const labourers = await Labourer.find().sort({ name: 1 });
    const monthAttendance = await AttendanceRecord.find({ date: { $regex: `^${month}` } });
    const monthSettlements = await Settlement.find({ date: { $regex: `^${month}` } });

    let totalWagesEarned = 0;
    let totalAdvancesGiven = 0;

    const reportRows = labourers.map((labourer) => {
      const att = monthAttendance.filter((a) => a.labourerId.toString() === labourer._id.toString());
      const set = monthSettlements.filter((s) => s.labourerId.toString() === labourer._id.toString());

      let daysPresent = 0;
      let halfDays = 0;
      let daysAbsent = 0;
      let totalEarned = 0;
      let totalWithdrawals = 0;

      att.forEach((rec) => {
        if (rec.status === 'present') {
          daysPresent++;
          totalEarned += labourer.dailyWage;
        } else if (rec.status === 'half') {
          halfDays++;
          totalEarned += labourer.dailyWage / 2;
        } else if (rec.status === 'absent') {
          daysAbsent++;
        }
        totalWithdrawals += rec.withdrawal || 0;
      });

      const totalSettled = set.reduce((acc, s) => acc + (s.amountSettled || 0), 0);
      const balance = Math.max(0, totalEarned - totalWithdrawals - totalSettled);

      totalWagesEarned += totalEarned;
      totalAdvancesGiven += totalWithdrawals;

      return {
        labourerId: labourer._id,
        name: labourer.name,
        dailyWage: labourer.dailyWage,
        daysPresent,
        halfDays,
        daysAbsent,
        totalEarned,
        totalWithdrawals,
        totalAdvances: totalWithdrawals,
        netBalanceOwed: balance,
        balance,
      };
    });

    reportRows.sort((a, b) => b.balance - a.balance);

    return res.status(200).json({
      month,
      totalWagesEarned,
      totalWagesPaid: totalWagesEarned,
      totalAdvancesGiven,
      netBalanceOutstanding: reportRows.reduce((acc, r) => acc + r.balance, 0),
      labourers: reportRows,
    });
  } catch (error) {
    next(error);
  }
};

export const exportMonthlySummaryCSV = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({
        error: {
          message: 'Query parameter month (YYYY-MM) is required',
          code: 'MISSING_MONTH',
        },
      });
    }

    // Reuse getMonthlySummary logic
    const labourers = await Labourer.find().sort({ name: 1 });
    const monthAttendance = await AttendanceRecord.find({ date: { $regex: `^${month}` } });
    const monthSettlements = await Settlement.find({ date: { $regex: `^${month}` } });

    let totalWagesEarned = 0;
    let totalAdvancesGiven = 0;

    const reportRows = labourers.map((labourer) => {
      const att = monthAttendance.filter((a) => a.labourerId.toString() === labourer._id.toString());
      const set = monthSettlements.filter((s) => s.labourerId.toString() === labourer._id.toString());

      let daysPresent = 0;
      let halfDays = 0;
      let daysAbsent = 0;
      let totalEarned = 0;
      let totalWithdrawals = 0;

      att.forEach((rec) => {
        if (rec.status === 'present') {
          daysPresent++;
          totalEarned += labourer.dailyWage;
        } else if (rec.status === 'half') {
          halfDays++;
          totalEarned += labourer.dailyWage / 2;
        } else if (rec.status === 'absent') {
          daysAbsent++;
        }
        totalWithdrawals += rec.withdrawal || 0;
      });

      const totalSettled = set.reduce((acc, s) => acc + (s.amountSettled || 0), 0);
      const balance = Math.max(0, totalEarned - totalWithdrawals - totalSettled);

      totalWagesEarned += totalEarned;
      totalAdvancesGiven += totalWithdrawals;

      return {
        name: labourer.name,
        dailyWage: labourer.dailyWage,
        daysPresent,
        halfDays,
        daysAbsent,
        totalEarned,
        totalWithdrawals,
        balance,
      };
    });

    const csvData = generateMonthlyReportCSV(month, {
      month,
      totalWagesEarned,
      totalAdvancesGiven,
      labourers: reportRows,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Shivam_Enterprises_Report_${month}.csv"`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
