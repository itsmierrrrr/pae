import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import marketPackRoutes from './routes/marketPackRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';

const app = express();
const uploadDir = path.resolve(process.cwd(), 'server', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('CORS blocked origin:', origin);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const name = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${timestamp}-${name}`);
  },
});

app.use('/uploads', express.static(uploadDir));
app.post('/api/uploads', multer({ storage }).single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded.' });
  }

  return res.status(201).json({
    success: true,
    data: { imageUrl: `/uploads/${req.file.filename}` },
    message: 'Image uploaded.',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', interviewRoutes);
app.use('/api', marketPackRoutes);
app.use('/api', pricingRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled server error:', error.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

export default app;
