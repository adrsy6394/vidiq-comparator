import { Router } from 'express';
import { createSession, getSessionHistory } from '../controllers/sessionController.js';

const router = Router();

// Create new chat session for comparison analysis
// POST /api/session
router.post('/', createSession);

// Fetch chat messages history
// GET /api/session/:sessionId
router.get('/:sessionId', getSessionHistory);

export default router;
