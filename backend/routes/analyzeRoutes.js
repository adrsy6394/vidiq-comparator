import { Router } from 'express';
import { z } from 'zod';
import { submitAnalysis } from '../controllers/analyzeController.js';
import { getJobStatus } from '../controllers/statusController.js';
import { getAnalysisResult } from '../controllers/analysisController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { analyzeLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Zod validation rule schema
const analyzeValidationSchema = z.object({
  body: z.object({
    youtubeUrl: z.string().trim().min(1, 'YouTube URL is required'),
    instagramUrl: z.string().trim().min(1, 'Instagram URL is required')
  })
});

// Submit URLs (Rate-limited and Zod validated)
router.post('/analyze', analyzeLimiter, validateRequest(analyzeValidationSchema), submitAnalysis);

// Poll job progress status
router.get('/status/:jobId', getJobStatus);

// Retrieve complete analytical comparison details
router.get('/analysis/:analysisId', getAnalysisResult);

export default router;
