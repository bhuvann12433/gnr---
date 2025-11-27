// backend/server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import os from 'os';
import app from './app.js';  // ⭐ IMPORTANT: load app.js

dotenv.config();

// --- Config ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gnr_surgicals';
const DB_NAME = process.env.DB_NAME || 'gnr_surgicals';

// ---- Helpers for graceful shutdown ----
let serverInstance = null;
const startServer = () => {
  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);

    // print LAN IPs
    const nets = os.networkInterfaces();
    Object.values(nets).forEach(ifaces =>
      ifaces.forEach(net => {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`   ➜ Network: http://${net.address}:${PORT}`);
        }
      })
    );
  });
};

const gracefulShutdown = async (signal) => {
  console.log(`\n[${new Date().toISOString()}] Received ${signal} — shutting down gracefully...`);
  try {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
  } finally {
    process.exit(0);
  }
};

// --- MongoDB connection ---
mongoose
  .connect(MONGO_URI, { dbName: DB_NAME })
  .then(() => {
    console.log(`✅ Connected to MongoDB [${DB_NAME}]`);
    startServer();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// --- Process signal handlers ---
process.once('SIGUSR2', async () => await gracefulShutdown('SIGUSR2'));
['SIGINT', 'SIGTERM'].forEach(sig =>
  process.on(sig, async () => await gracefulShutdown(sig))
);

process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});
