import OpenAI from 'openai';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.OPENROUTER_API_KEY || 'mock-key',
  defaultHeaders: {
    'HTTP-Referer': 'https://vidiq-comparator.local', // Required by OpenRouter
    'X-Title': 'VidIQ Comparator',
  }
});

/**
 * Groups consecutive transcript segments into larger chunks of approximately target length.
 * Automatically extracts the correct startTime and endTime for each chunk.
 * 
 * @param {Array<{text: string, start: number, duration: number}>} segments 
 * @param {number} targetCharCount - Target size of each chunk in characters (approx 1500 chars = 375-500 tokens)
 * @returns {Array<{text: string, startTime: number, endTime: number}>} grouped chunks
 */
export const chunkTranscript = (segments, targetCharCount = 1500) => {
  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    return [];
  }

  const chunks = [];
  let currentChunkTexts = [];
  let currentLength = 0;
  let startTime = null;
  let endTime = null;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    
    // Set start time for the beginning of a new chunk group
    if (currentChunkTexts.length === 0) {
      startTime = seg.start;
    }
    
    currentChunkTexts.push(seg.text);
    currentLength += seg.text.length + 1; // +1 for spacing
    endTime = seg.start + (seg.duration || 0);

    // Push chunk if target length reached or if it's the last segment
    if (currentLength >= targetCharCount || i === segments.length - 1) {
      chunks.push({
        text: currentChunkTexts.join(' ').replace(/\s+/g, ' ').trim(),
        startTime: Math.round(startTime * 100) / 100,
        endTime: Math.round(endTime * 100) / 100
      });
      currentChunkTexts = [];
      currentLength = 0;
    }
  }

  return chunks;
};

/**
 * Generate vector embeddings for a list of text strings using OpenAI
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of 1536-dimensional float arrays
 */
export const generateEmbeddings = async (texts) => {
  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  // Bypass API if using mock key
  if (env.OPENROUTER_API_KEY.startsWith('sk-mock')) {
    logger.warn(`Mock OpenRouter key detected. Generating ${texts.length} dummy embeddings (1536-dim).`);
    return texts.map(() => 
      Array.from({ length: 1536 }, () => Math.round((Math.random() * 2 - 1) * 100000) / 100000)
    );
  }

  try {
    const batchSize = 20;
    const embeddings = [];

    // OpenAI limits batch sizes, we slice and batch in blocks of 20
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const response = await openai.embeddings.create({
        model: 'openai/text-embedding-3-small', // OpenRouter hosts text-embedding-3-small
        input: batch,
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  } catch (error) {
    logger.error(`Error in generateEmbeddings: ${error.message}`);
    throw error;
  }
};
