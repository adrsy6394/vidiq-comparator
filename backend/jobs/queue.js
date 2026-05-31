import Queue from 'bull';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

// Initialize Bull Queue instance named 'video-analysis'
export const analysisQueue = new Queue('video-analysis', env.REDIS_URL);

// Log queue event milestones
analysisQueue.on('error', (error) => {
  logger.error(`Bull Queue Error: ${error.message}`);
});

analysisQueue.on('active', (job) => {
  logger.info(`Job ${job.id} started processing.`);
});

analysisQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully.`);
});

analysisQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed with error: ${error.message}`);
});
export default analysisQueue;
