import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import labourerRoutes from './routes/labourers.js';
import attendanceRoutes from './routes/attendance.js';
import reportRoutes from './routes/reports.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigin === '*' ||
        origin === allowedOrigin ||
        allowedOrigin.split(',').map((s) => s.trim()).includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsing & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logger
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Shivam Enterprises REST API Service Online' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/labourers', labourerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
