import { z } from 'zod';
import { Labourer } from '../models/Labourer.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { Settlement } from '../models/Settlement.js';
import { calculateLabourerBalance } from '../utils/balanceCalculator.js';

const labourerSchema = z.object({
  name: z.string().min(1, 'Labourer name is required').trim(),
  dailyWage: z.number().min(0, 'Daily wage must be a non-negative number'),
});

const updateLabourerSchema = z.object({
  name: z.string().min(1).trim().optional(),
  dailyWage: z.number().min(0).optional(),
  active: z.boolean().optional(),
});

export const getLabourers = async (req, res, next) => {
  try {
    const { active } = req.query;

    let filter = {};
    if (active === 'true' || active === undefined) {
      filter.active = true;
    } else if (active === 'false') {
      filter.active = false;
    } // active === 'all' includes all labourers

    const labourers = await Labourer.find(filter).sort({ name: 1 });

    const labourersWithBalance = await Promise.all(
      labourers.map(async (l) => {
        const stats = await calculateLabourerBalance(l._id, l.dailyWage);
        return {
          id: l._id,
          _id: l._id,
          name: l.name,
          dailyWage: l.dailyWage,
          active: l.active,
          isActive: l.active,
          joinedDate: l.joinedDate,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
          balance: stats.balance,
          balanceOwed: stats.balance,
        };
      })
    );

    return res.status(200).json(labourersWithBalance);
  } catch (error) {
    next(error);
  }
};

export const createLabourer = async (req, res, next) => {
  try {
    const parseResult = labourerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: parseResult.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const { name, dailyWage } = parseResult.data;
    const newLabourer = await Labourer.create({
      name,
      dailyWage,
      active: true,
      joinedDate: new Date(),
    });

    return res.status(201).json({
      id: newLabourer._id,
      _id: newLabourer._id,
      name: newLabourer.name,
      dailyWage: newLabourer.dailyWage,
      active: newLabourer.active,
      isActive: newLabourer.active,
      joinedDate: newLabourer.joinedDate,
      createdAt: newLabourer.createdAt,
      balance: 0,
      balanceOwed: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLabourer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = updateLabourerSchema.safeParse(req.body);
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

    Object.assign(labourer, parseResult.data);
    await labourer.save();

    const stats = await calculateLabourerBalance(labourer._id, labourer.dailyWage);

    return res.status(200).json({
      id: labourer._id,
      _id: labourer._id,
      name: labourer.name,
      dailyWage: labourer.dailyWage,
      active: labourer.active,
      isActive: labourer.active,
      joinedDate: labourer.joinedDate,
      createdAt: labourer.createdAt,
      balance: stats.balance,
      balanceOwed: stats.balance,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLabourer = async (req, res, next) => {
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

    // Cascade delete attendance records and settlements
    await AttendanceRecord.deleteMany({ labourerId: id });
    await Settlement.deleteMany({ labourerId: id });
    await Labourer.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Labourer and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
