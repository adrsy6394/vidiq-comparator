import { Router } from 'express';
import { streamChat } from '../controllers/chatController.js';

const router = Router();

// Streaming chat response endpoint (SSE)
// POST /api/chat
router.post('/', streamChat);

export default router;
