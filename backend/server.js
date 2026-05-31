import mongoose from 'mongoose';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { analysisQueue } from './jobs/queue.js';
import logger from './utils/logger.js';

const PORT = env.PORT || 3001;

// 1. Establish Database Connectivity
connectDB();

// 2. Start HTTP listener
const server = app.listen(PORT, () => {
  logger.info(`===============================================`);
  logger.info(`🚀 VidIQ Comparator Backend server running...`);
  logger.info(`   - Local Address: http://localhost:${PORT}`);
  logger.info(`   - Mode: ${env.NODE_ENV}`);
  logger.info(`===============================================`);
});

/**
 * Handle graceful server shutdowns
 */
const gracefulShutdown = async (signal) => {
  logger.info(`⚠️ Received ${signal}. Starting graceful shutdown sequence...`);
  
  // Stop receiving new connections
  server.close(async () => {
    logger.info('🚪 HTTP server closed.');
    try {
      // Close Mongoose connection
      await mongoose.connection.close();
      logger.info('🔌 MongoDB database connection closed.');

      // Close Bull Queue Redis client bindings
      await analysisQueue.close();
      logger.info('🔌 Bull Queue Redis connection closed.');

      logger.info('💀 Graceful shutdown completed. Exiting process.');
      process.exit(0);
    } catch (err) {
      logger.error(`❌ Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if sockets hang
  setTimeout(() => {
    logger.error('🚨 Graceful shutdown timed out. Force exiting...');
    process.exit(1);
  }, 10000);
};

// Listen for process terminate signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
