import express from 'express';
import {
  getMonthlySummary,
  exportMonthlySummaryCSV,
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getMonthlySummary);
router.get('/summary.csv', exportMonthlySummaryCSV);
router.get('/monthly', getMonthlySummary); // Alias for frontend compatibility

export default router;
