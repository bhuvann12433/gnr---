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

// CORS origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow direct tools / server-to-server requests (no origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`❌ CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

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
    uptime_seconds: process.uptime().toFixed(0),
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
    // For nodemon SIGUSR2 we want to exit with the same signal so nodemon can restart
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
    // don't crash silently - exit with non-zero so process managers know
    process.exit(1);
  });

// --- Process signal handlers ---
// nodemon uses SIGUSR2 to restart; handle it specially so we restart cleanly
process.once('SIGUSR2', async () => {
  await gracefulShutdown('SIGUSR2');
});

// normal termination signals
['SIGINT', 'SIGTERM'].forEach((sig) =>
  process.on(sig, async () => {
    await gracefulShutdown(sig);
  })
);

// catch unhandled rejections/exceptions so we can log & exit cleanly
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // allow the process manager to restart (exit non-zero)
  process.exit(1);
});
