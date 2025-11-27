// backend/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();

// ==========================
// ⭐ UPDATED CORS CONFIG
// ==========================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : [
      'https://gnr-warehouse-main.vercel.app', // Your Vercel frontend (IMPORTANT)
      'http://localhost:5173',                // Local dev
      'http://127.0.0.1:5173'
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Curl / Postman / Server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(
      new Error(`CORS policy: This origin is not allowed -> ${origin}`)
    );
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==========================
//  Middlewares
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
//  ROUTES
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/stats', statsRoutes);

// ==========================
//  Root Route
// ==========================
app.get('/', (req, res) => {
  res.send('🚀 Backend is running — GNR Surgicals API');
});

// ==========================
//  Health Check Route
// ==========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    env: process.env.NODE_ENV || 'development',
  });
});

// ==========================
//  FRIENDLY CORS ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS blocked', message: err.message });
  }
  next(err);
});

export default app;
cd