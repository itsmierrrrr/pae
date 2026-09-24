import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateId, memoryStore, sanitizeUser } from '../utils/dataStore.js';
import User from '../models/User.js';

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

export const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingInMemory = memoryStore.users.find((user) => user.email.toLowerCase() === normalizedEmail);
  const existingInDatabase = mongoose.connection.readyState === 1 ? await User.findOne({ email: normalizedEmail }) : null;
  const existing = existingInMemory || existingInDatabase;
  if (existing) {
    return res.status(409).json({ success: false, message: 'User already exists.' });
  }

  if (mongoose.connection.readyState === 1) {
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role: 'artisan',
    });
    const token = createToken(String(user._id));

    return res.status(201).json({
      success: true,
      data: { token, user: sanitizeUser(user) },
      message: 'Registration successful.',
    });
  }

  const user = {
    id: generateId('user'),
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: 'artisan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.users.push(user);
  const token = createToken(user.id);

  return res.status(201).json({
    success: true,
    data: { token, user: sanitizeUser(user) },
    message: 'Registration successful.',
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = createToken(String(user._id));
    return res.json({
      success: true,
      data: { token, user: sanitizeUser(user) },
      message: 'Login successful.',
    });
  }

  const user = memoryStore.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const token = createToken(user.id);

  return res.json({
    success: true,
    data: { token, user: sanitizeUser(user) },
    message: 'Login successful.',
  });
};

export const me = async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  }

  const user = memoryStore.users.find((entry) => entry.id === req.user.id || entry._id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, data: sanitizeUser(user) });
};
