import { analysisQueue } from '../jobs/queue.js';
import Analysis from '../models/Analysis.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Determine the active executing step
 */
const getActiveStep = (steps) => {
  if (!steps) return 'pending';
  if (steps.analysis === 'processing') return 'analysis';
  if (steps.embedding === 'processing') return 'embedding';
  if (steps.transcript === 'processing') return 'transcript';
  if (steps.metadata === 'processing') return 'metadata';
  
  // Fallbacks
  if (steps.analysis === 'pending') return 'analysis';
  if (steps.embedding === 'pending') return 'embedding';
  if (steps.transcript === 'pending') return 'transcript';
  if (steps.metadata === 'pending') return 'metadata';
  return 'ready';
};

/**
 * Calculate the count of completed steps
 */
const getCompletedStepsCount = (steps) => {
  if (!steps) return 0;
  let count = 0;
  if (steps.metadata === 'done') count++;
  if (steps.transcript === 'done') count++;
  if (steps.embedding === 'done') count++;
  if (steps.analysis === 'done') count++;
  return count;
};

/**
 * Poll progress of an analysis job
 * GET /api/status/:jobId
 */
export const getJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    let analysisId = jobId;

    const isMock = jobId.startsWith('mock-job-');
    const isRedisConnected = analysisQueue.client && analysisQueue.client.status === 'ready';

    if (!isMock && isRedisConnected) {
      // 1. Fetch job from Bull Queue
      const job = await analysisQueue.getJob(jobId);
      if (!job) {
        throw new NotFoundError(`No background analysis job found with ID: ${jobId}`);
      }
      analysisId = job.data.analysisId;
    } else if (isMock) {
      analysisId = jobId.replace('mock-job-', '');
    }

    // 2. Fetch step details from Mongoose record
    const analysis = await Analysis.findOne({ analysisId });
    if (!analysis) {
      throw new NotFoundError(`No analysis database record found for ID: ${analysisId}`);
    }

    const steps = analysis.processingSteps;
    const completedCount = getCompletedStepsCount(steps);
    const progressPercent = Math.round((completedCount / 4) * 100);

    // 3. Return JSON payload
    return res.status(200).json({
      success: true,
      jobId,
      analysisId,
      status: analysis.status,
      progress: {
        step: getActiveStep(steps),
        stepsCompleted: completedCount,
        totalSteps: 4,
        steps,
        percent: progressPercent
      }
    });

  } catch (error) {
    next(error);
  }
};
