import { z } from 'zod';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { Labourer } from '../models/Labourer.js';

const upsertAttendanceSchema = z.object({
  // Allow null explicitly — when user clears attendance stamp
  status: z
    .union([z.enum(['present', 'half', 'absent']), z.null()])
    .optional()
    .transform((val) => (val === undefined ? undefined : val)), // keep undefined as-is
  withdrawal: z.number().min(0).optional(),
});


export const getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        error: {
          message: 'Query parameter date (YYYY-MM-DD) is required',
          code: 'MISSING_DATE',
        },
      });
    }

    const activeLabourers = await Labourer.find({ active: true }).sort({ name: 1 });
    const records = await AttendanceRecord.find({ date });

    const result = activeLabourers.map((labourer) => {
      const existing = records.find((r) => r.labourerId.toString() === labourer._id.toString());
      const status = existing ? existing.status : null;
      const withdrawal = existing ? existing.withdrawal : 0;

      let earnedAmount = 0;
      if (status === 'present') earnedAmount = labourer.dailyWage;
      else if (status === 'half') earnedAmount = labourer.dailyWage / 2;

      return {
        labourer: {
          id: labourer._id,
          _id: labourer._id,
          name: labourer.name,
          dailyWage: labourer.dailyWage,
          active: labourer.active,
          isActive: labourer.active,
        },
        attendanceId: existing?._id,
        date,
        status,
        withdrawal,
        advanceTaken: withdrawal,
        earnedAmount,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const upsertAttendance = async (req, res, next) => {
  try {
    const { labourerId, date } = req.params;
    const parseResult = upsertAttendanceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: parseResult.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const labourer = await Labourer.findById(labourerId);
    if (!labourer) {
      return res.status(404).json({
        error: {
          message: 'Labourer not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const { status, withdrawal } = parseResult.data;

    let record = await AttendanceRecord.findOne({ labourerId, date });
    if (record) {
      if (status !== undefined) record.status = status;
      if (withdrawal !== undefined) record.withdrawal = withdrawal;
      await record.save();
    } else {
      record = await AttendanceRecord.create({
        labourerId,
        date,
        status: status !== undefined ? status : null,
        withdrawal: withdrawal !== undefined ? withdrawal : 0,
      });
    }

    let earnedAmount = 0;
    if (record.status === 'present') earnedAmount = labourer.dailyWage;
    else if (record.status === 'half') earnedAmount = labourer.dailyWage / 2;

    return res.status(200).json({
      id: record._id,
      _id: record._id,
      labourerId: record.labourerId,
      date: record.date,
      status: record.status,
      withdrawal: record.withdrawal,
      advanceTaken: record.withdrawal,
      earnedAmount,
    });
  } catch (error) {
    next(error);
  }
};
