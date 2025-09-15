// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';

import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();

// --- Config ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gnr_surgicals';
const DB_NAME = process.env.DB_NAME || 'gnr_surgicals';

// Build allowedOrigins from env or sensible defaults, then augment with server LAN IPs
let allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Add detected LAN IPs with port 5173 (useful when frontend is opened via LAN IP)
try {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        const lanOrigin = `http://${net.address}:5173`;
        if (!allowedOrigins.includes(lanOrigin)) allowedOrigins.push(lanOrigin);
      }
    }
  }
} catch (e) {
  // no-op if os/networkInterfaces fails
}

// CORS options and logger
const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server / curl (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    const msg = `CORS policy: This origin is not allowed -> ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/stats', statsRoutes);

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Gnr Surgicals API is running',
    db: DB_NAME,
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// --- Basic middleware: show allowed origins in logs ---
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[req] ${req.method} ${req.originalUrl} — origin: ${req.get('origin') || 'none'}`);
  }
  next();
});

// --- Error handler for CORS and other errors ---
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    console.warn('CORS blocked:', err.message);
    return res.status(403).json({ error: 'CORS blocked', message: err.message });
  }

  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'server_error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ---- Helpers for graceful shutdown ----
let serverInstance = null;
const startServer = () => {
  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    // print LAN IPs
    const nets = os.networkInterfaces();
    const lanIps = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          lanIps.push(net.address);
        }
      }
    }
    lanIps.forEach((ip) => console.log(`   ➜ Network: http://${ip}:${PORT}`));
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });
};

const gracefulShutdown = async (signal) => {
  try {
    console.log(`\n[${new Date().toISOString()}] Received ${signal} — shutting down gracefully...`);
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('HTTP server closed.');
      });
    }
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
  } finally {
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  }
};

// --- MongoDB connection ---
mongoose
  .connect(MONGO_URI, { dbName: DB_NAME, useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`✅ Connected to MongoDB [${DB_NAME}]`);
    startServer();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error && error.message ? error.message : error);
    process.exit(1);
  });

// --- Process signal handlers ---
process.once('SIGUSR2', async () => {
  await gracefulShutdown('SIGUSR2');
});

['SIGINT', 'SIGTERM'].forEach((sig) =>
  process.on(sig, async () => {
    await gracefulShutdown(sig);
  })
);

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});
