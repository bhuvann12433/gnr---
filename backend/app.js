// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();

// --- CORS config: use CORS_ORIGIN env or sensible dev defaults ---
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl/server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: This origin is not allowed -> ${origin}`));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', env: process.env.NODE_ENV || 'development' });
});

// friendly CORS error helper
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS blocked', message: err.message });
  }
  next(err);
});

export default app;
