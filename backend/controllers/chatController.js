import OpenAI from 'openai';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import ChatHistory from '../models/ChatHistory.js';
import { prepareChatRequest } from '../services/chatService.js';
import { randomUUID } from 'crypto';

// Initialize the OpenRouter client configuration
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.OPENROUTER_API_KEY || 'mock-key',
  defaultHeaders: {
    'HTTP-Referer': 'https://vidiq-comparator.local', // Required by OpenRouter
    'X-Title': 'VidIQ Comparator',
  }
});

/**
 * Mock async generator stream to simulate real-time LLM token generation when API key is a mock sk-key
 * @param {string} query - user's question
 * @returns {AsyncGenerator} simulated choices stream
 */
async function* getMockStream(query) {
  const responseText = `Based on the transcripts, Video A (YouTube) opens with a direct, promise-based hook in the first 30 seconds [Video A - 00:10], outlining specific channel growth strategies. Conversely, Video B (Instagram) utilizes a POV-style visual hook [Video B - 00:15] to immediately engage viewers in their feeds. This difference in hook structure and pacing explains the variance in their overall engagement.`;
  const words = responseText.split(' ');
  for (const word of words) {
    yield {
      choices: [{
        delta: {
          content: word + ' '
        }
      }]
    };
    // Delay 30ms to simulate network streaming
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

/**
 * Streaming chat response handler using Server-Sent Events (SSE).
 * POST /api/chat
 */
export const streamChat = async (req, res, next) => {
  const { message, analysisId, sessionId } = req.body;

  // 1. Basic validation
  if (!message || !analysisId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'message, analysisId, and sessionId are required',
      code: 'VALIDATION_ERROR'
    });
  }

  logger.info(`Chat: Starting stream response for session ${sessionId}, query: "${message.substring(0, 30)}..."`);

  try {
    // 2. Prepare chat prompts and retrieve vector contexts
    const { messages, sources } = await prepareChatRequest(analysisId, sessionId, message);

    // 3. Set up SSE stream headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Avoid nginx caching response chunks
    res.flushHeaders(); // Flush the headers immediately to start the SSE connection

    // 4. Initiate stream (real OpenRouter call or mock fallback)
    let stream;
    if (env.OPENROUTER_API_KEY.startsWith('sk-mock')) {
      logger.warn('Chat: Mock OpenRouter key detected. Activating simulated streaming.');
      stream = getMockStream(message);
    } else {
      stream = await openrouter.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: messages,
        temperature: 0.3,
        stream: true,
      });
    }

    let fullResponseText = '';

    // 5. Pipe stream tokens token-by-token using SSE format
    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || '';
      if (token) {
        fullResponseText += token;
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      }
    }

    // 6. Write transaction to MongoDB ChatHistory record
    const userMsgId = `msg-${randomUUID()}`;
    const assistantMsgId = `msg-${randomUUID()}`;

    const chatSession = await ChatHistory.findOne({ sessionId });
    if (chatSession) {
      chatSession.messages.push({
        id: userMsgId,
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      chatSession.messages.push({
        id: assistantMsgId,
        role: 'assistant',
        content: fullResponseText,
        sources: sources,
        timestamp: new Date()
      });

      chatSession.messageCount = chatSession.messages.length;
      await chatSession.save();
      logger.info(`Chat: Saved session history entry for ${sessionId}. Total messages: ${chatSession.messageCount}`);
    } else {
      logger.warn(`Chat: Session ${sessionId} was not found when trying to save messages.`);
    }

    // 7. Write final SSE done event with citations data and close stream
    res.write(`data: ${JSON.stringify({ type: 'done', sources })}\n\n`);
    res.end();

  } catch (error) {
    logger.error(`Chat: SSE stream failed: ${error.message}`);
    
    if (res.headersSent) {
      // If headers were already flushed, send an error frame and close the stream
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Stream processing error' })}\n\n`);
      res.end();
    } else {
      // If headers haven't been sent, we can respond with structured JSON errors
      if (error.code === 'NOT_FOUND') {
        return res.status(404).json({ success: false, error: error.message, code: 'NOT_FOUND' });
      }
      if (error.code === 'NOT_READY') {
        return res.status(400).json({ success: false, error: error.message, code: 'NOT_READY' });
      }
      if (error.code === 'SESSION_NOT_FOUND') {
        return res.status(404).json({ success: false, error: error.message, code: 'SESSION_NOT_FOUND' });
      }
      next(error);
    }
  }
};
