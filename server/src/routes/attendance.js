import express from 'express';
import {
  getAttendanceByDate,
  upsertAttendance,
} from '../controllers/attendanceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAttendanceByDate);
router.post('/', upsertAttendance);
router.put('/:labourerId/:date', upsertAttendance);

export default router;
