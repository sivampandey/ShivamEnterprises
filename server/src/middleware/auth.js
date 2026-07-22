import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from httpOnly cookie or Authorization header
    let token = req.cookies ? req.cookies.shivam_jwt_token : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // 2. Verify JWT token
    const secret = process.env.JWT_SECRET || 'shivam_enterprises_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired session token.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Invalid or expired authentication token.',
        code: 'UNAUTHORIZED',
      },
    });
  }
};
