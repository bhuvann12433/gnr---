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
// ⭐ FINAL, FULLY FIXED CORS CONFIG
// ==========================

const allowedOrigins = [
  'https://gnr-warehouse-main.vercel.app',  // your frontend domain
  'https://*.vercel.app',                   // allow Vercel preview deployments
  'http://localhost:5173',                  // local dev
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server & Postman

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed.includes('*')) {
          // wildcard support
          const pattern = new RegExp('^' + allowed.replace('*', '.*') + '$');
          return pattern.test(origin);
        }
        return allowed === origin;
      });

      if (isAllowed) return callback(null, true);

      return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
    },

    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
  })
);

// allow OPTIONS for all routes
app.options('*', cors());

// ==========================
//  MIDDLEWARES
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
//  ROOT ROUTE
// ==========================
app.get('/', (req, res) => {
  res.send('🚀 Backend is running — GNR Surgicals API');
});

// ==========================
//  HEALTH CHECK
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
    return res.status(403).json({
      error: 'CORS blocked',
      message: err.message,
    });
  }
  next(err);
});

export default app;
