import { randomUUID } from 'crypto';
import Analysis from '../models/Analysis.js';
import ChatHistory from '../models/ChatHistory.js';
import logger from '../utils/logger.js';

/**
 * Create a new chat session linked to a specific analysis session.
 * POST /api/session
 */
export const createSession = async (req, res, next) => {
  try {
    const { analysisId } = req.body;
    
    if (!analysisId) {
      return res.status(400).json({
        success: false,
        error: 'analysisId is required',
        code: 'VALIDATION_ERROR'
      });
    }

    // 1. Verify Analysis exists
    const analysis = await Analysis.findOne({ analysisId });
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
        code: 'NOT_FOUND'
      });
    }

    // 2. Generate new unique session UUID
    const sessionId = `sess-${randomUUID()}`;

    // 3. Create document in chatHistory collection
    await ChatHistory.create({
      sessionId,
      analysisId,
      messages: [],
      messageCount: 0
    });

    logger.info(`Session: Created session ${sessionId} for analysis ${analysisId}`);

    return res.status(201).json({
      success: true,
      sessionId
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve the full chat history and sources list for an active session.
 * GET /api/session/:sessionId
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Fetch the session history
    const chatSession = await ChatHistory.findOne({ sessionId });
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      sessionId: chatSession.sessionId,
      analysisId: chatSession.analysisId,
      messages: chatSession.messages
    });

  } catch (error) {
    next(error);
  }
};
