import { retrieveContext } from '../rag/retriever.js';
import { SYSTEM_PROMPT, formatUserPrompt } from '../rag/promptTemplates.js';
import ChatHistory from '../models/ChatHistory.js';
import Analysis from '../models/Analysis.js';
import logger from '../utils/logger.js';

/**
 * Format raw duration seconds into MM:SS format helper
 * @param {number} seconds 
 * @returns {string} MM:SS formatted string
 */
const formatTimestamp = (seconds) => {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Validates session, retrieves vector contexts, deduplicates & sorts transcripts, 
 * formats history, and structures LLM prompt messages.
 * 
 * @param {string} analysisId - Active analysis identifier
 * @param {string} sessionId - Active chat session identifier
 * @param {string} query - New question submitted by user
 * @returns {Promise<{ messages: Array<{role: string, content: string}>, sources: Array<object> }>} Chat payload and sources
 */
export const prepareChatRequest = async (analysisId, sessionId, query) => {
  // 1. Fetch and validate Analysis document
  const analysisDoc = await Analysis.findOne({ analysisId });
  if (!analysisDoc) {
    const err = new Error(`Analysis record ${analysisId} not found.`);
    err.code = 'NOT_FOUND';
    throw err;
  }
  
  if (analysisDoc.status !== 'ready') {
    const err = new Error(`Analysis comparison ${analysisId} is still processing.`);
    err.code = 'NOT_READY';
    throw err;
  }

  // 2. Fetch Chat Session
  const chatSession = await ChatHistory.findOne({ sessionId });
  if (!chatSession) {
    const err = new Error(`Session ${sessionId} not found.`);
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }

  // 3. Retrieve Context from Qdrant
  let matches = [];
  try {
    matches = await retrieveContext(analysisId, query);
  } catch (err) {
    logger.warn(`RAG: retrieveContext failed: ${err.message}`);
  }

  // Fallback: If Qdrant is offline or empty, load clean transcripts/raw transcript from MongoDB Video records
  if (!matches || matches.length === 0) {
    logger.info(`RAG: Qdrant context empty. Falling back to MongoDB transcripts for analysis: ${analysisId}`);
    const Video = (await import('../models/Video.js')).default;
    const videos = await Video.find({ analysisId });
    
    matches = [];
    videos.forEach(v => {
      let rawSegments = [];
      try {
        if (v.transcriptRaw) {
          rawSegments = JSON.parse(v.transcriptRaw);
        }
      } catch (err) {
        logger.warn(`RAG: Failed parsing transcriptRaw for ${v.platform}: ${err.message}`);
      }

      if (Array.isArray(rawSegments) && rawSegments.length > 0) {
        rawSegments.forEach((seg, idx) => {
          matches.push({
            id: `fallback-${v.platform}-${idx}`,
            payload: {
              analysisId,
              platform: v.platform,
              videoId: v.videoId,
              text: seg.text,
              startTime: seg.start,
              chunkIndex: idx
            }
          });
        });
      } else {
        const textVal = v.transcriptClean || v.description || '';
        if (textVal.trim().length > 0) {
          matches.push({
            id: `fallback-${v.platform}`,
            payload: {
              analysisId,
              platform: v.platform,
              videoId: v.videoId,
              text: textVal,
              startTime: 0,
              chunkIndex: 0
            }
          });
        }
      }
    });
  }

  // 4. Deduplicate matches by (platform, chunkIndex)
  const seen = new Set();
  const uniqueChunks = [];
  for (const match of matches) {
    if (!match.payload) continue;
    const key = `${match.payload.platform}_${match.payload.chunkIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueChunks.push(match);
    }
  }

  // 5. Sort matches chronologically within platform (YouTube/Video A first, then Instagram/Video B)
  uniqueChunks.sort((a, b) => {
    if (a.payload.platform !== b.payload.platform) {
      return a.payload.platform === 'youtube' ? -1 : 1;
    }
    return a.payload.chunkIndex - b.payload.chunkIndex;
  });

  // 6. Format context string and construct source details
  const youtubeChunks = uniqueChunks.filter(c => c.payload.platform === 'youtube');
  const instagramChunks = uniqueChunks.filter(c => c.payload.platform === 'instagram');

  let contextStr = '';
  if (youtubeChunks.length > 0) {
    contextStr += '--- Video A (YouTube) ---\n';
    youtubeChunks.forEach(c => {
      const ts = formatTimestamp(c.payload.startTime);
      contextStr += `[${ts}] "${c.payload.text}"\n`;
    });
    contextStr += '\n';
  }
  if (instagramChunks.length > 0) {
    contextStr += '--- Video B (Instagram) ---\n';
    instagramChunks.forEach(c => {
      const ts = formatTimestamp(c.payload.startTime);
      contextStr += `[${ts}] "${c.payload.text}"\n`;
    });
  }

  // Map to sources format details returned in the final done SSE event
  const sources = uniqueChunks.map(c => {
    const platformLabel = c.payload.platform === 'youtube' ? 'YouTube' : 'Instagram';
    const videoLabel = c.payload.platform === 'youtube' ? 'Video A' : 'Video B';
    return {
      videoLabel: `${videoLabel} (${platformLabel})`,
      platform: c.payload.platform,
      timestamp: formatTimestamp(c.payload.startTime),
      excerpt: c.payload.text.length > 100 ? `${c.payload.text.substring(0, 100)}...` : c.payload.text,
      chunkIndex: c.payload.chunkIndex
    };
  });

  // 7. Get last 10 messages of history (to fit context limitations safely)
  const recentMessages = chatSession.messages.slice(-10);

  // 8. Assemble User Message Prompt
  const userMessage = formatUserPrompt(contextStr, recentMessages, query);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ];

  logger.info(`RAG: Prompt prepared successfully for session: ${sessionId} with ${sources.length} sources.`);

  return {
    messages,
    sources
  };
};
