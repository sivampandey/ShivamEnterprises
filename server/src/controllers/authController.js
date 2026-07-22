import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Admin } from '../models/Admin.js';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

export const login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: parseResult.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const { username, password } = parseResult.data;

    // Search admin in DB
    let admin = await Admin.findOne({ username: username.toLowerCase() });

    // Auto-seed initial admin if database has zero admins
    const adminCount = await Admin.countDocuments();
    if (!admin && adminCount === 0 && username.toLowerCase() === 'admin') {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      admin = await Admin.create({ username: 'admin', passwordHash });
    }

    if (!admin) {
      return res.status(401).json({
        error: {
          message: 'Invalid username or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid username or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const secret = process.env.JWT_SECRET || 'shivam_enterprises_super_secret_jwt_key_2026';
    const token = jwt.sign({ id: admin._id, username: admin.username }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('shivam_jwt_token', token, getCookieOptions());

    return res.status(200).json({
      admin: {
        id: admin._id,
        username: admin.username,
      },
      user: {
        id: admin._id,
        username: admin.username,
        name: 'Shivam Shop Admin',
        role: 'ADMIN',
      },
      token, // Return token for compatibility if client stores JWT
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('shivam_jwt_token', getCookieOptions());
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
    },
    user: {
      id: req.admin._id,
      username: req.admin.username,
      name: 'Shivam Shop Admin',
      role: 'ADMIN',
    },
  });
};
