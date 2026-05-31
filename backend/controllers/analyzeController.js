import { randomUUID } from 'crypto';
import Analysis from '../models/Analysis.js';
import { analysisQueue } from '../jobs/queue.js';
import { validateUrls } from '../utils/urlParser.js';
import logger from '../utils/logger.js';

/**
 * Submit video URLs for side-by-side analysis
 * POST /api/analyze
 */
export const submitAnalysis = async (req, res, next) => {
  try {
    const { youtubeUrl, instagramUrl } = req.body;

    logger.info(`Received analysis request. YT: "${youtubeUrl}", IG: "${instagramUrl}"`);

    // 1. Validate URLs using parser rules (throws validation error if invalid)
    const { youtubeId, instagramId } = validateUrls(youtubeUrl, instagramUrl);

    // 2. Generate new analysis UUID
    const analysisId = randomUUID();

    // 3. Create placeholder record in MongoDB Atlas
    const analysisRecord = await Analysis.create({
      analysisId,
      videoA: { videoId: youtubeId, platform: 'youtube' },
      videoB: { videoId: instagramId, platform: 'instagram' },
      status: 'processing',
      processingSteps: {
        metadata: 'pending',
        transcript: 'pending',
        embedding: 'pending',
        analysis: 'pending'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // TTL 30 days
    });

    // 4. Add task to Bull Queue (handled in background by Redis) or run in-memory fallback
    const isRedisConnected = analysisQueue.client && analysisQueue.client.status === 'ready';
    let jobId;

    if (isRedisConnected && process.env.NODE_ENV !== 'test') {
      const job = await analysisQueue.add({
        analysisId,
        youtubeUrl,
        instagramUrl
      });
      jobId = job.id;
      logger.info(`Successfully created analysis ${analysisId} and queued job ${jobId}`);
    } else {
      jobId = `mock-job-${analysisId}`;
      logger.info(`[IN-MEMORY MODE] Queueing analysis ${analysisId} locally. (Redis connected: ${isRedisConnected})`);

      const mockJob = {
        id: jobId,
        data: { analysisId, youtubeUrl, instagramUrl },
        progress: (percent) => logger.info(`[In-Memory Job Progress] ${analysisId}: ${percent}%`)
      };

      setImmediate(async () => {
        try {
          const { processAnalysisJob } = await import('../jobs/analysisJob.js');
          await processAnalysisJob(mockJob);
        } catch (err) {
          logger.error(`[In-Memory Job Error] ${analysisId}: ${err.message}`);
        }
      });
    }

    // 5. Respond to client with 202 Accepted
    return res.status(202).json({
      success: true,
      analysisId,
      jobId,
      message: 'Analysis started. Poll /status/:jobId for progress.'
    });

  } catch (error) {
    next(error);
  }
};
