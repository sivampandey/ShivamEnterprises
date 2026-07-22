import express from 'express';
import {
  getLabourers,
  createLabourer,
  updateLabourer,
  deleteLabourer,
} from '../controllers/labourerController.js';
import {
  getLabourerLedger,
  recordSettlement,
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes with authMiddleware
router.use(authMiddleware);

router.get('/', getLabourers);
router.post('/', createLabourer);
router.patch('/:id', updateLabourer);
router.delete('/:id', deleteLabourer);

// Ledger & Settlement per labourer
router.get('/:id/ledger', getLabourerLedger);
router.post('/:id/settle', recordSettlement);

export default router;
