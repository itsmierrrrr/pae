import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { memoryStore } from '../utils/dataStore.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      req.user = {
        id: String(user._id),
        email: user.email,
        name: user.name,
      };
      return next();
    }

    const user = memoryStore.users.find((entry) => entry._id === decoded.id || entry.id === decoded.id) || null;

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};
