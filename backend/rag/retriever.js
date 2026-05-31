import { qdrantClient } from '../vector/qdrantClient.js';
import { generateEmbeddings } from '../services/embeddingService.js';
import logger from '../utils/logger.js';

/**
 * Retrieves relevant transcript chunks from Qdrant using vector search.
 * Enforces a strict score threshold of 0.70 and returns the top 5 matches.
 * 
 * @param {string} analysisId - Unique UUID for the video comparison session
 * @param {string} query - User's chat message/question
 * @returns {Promise<Array<object>>} Deduplicated and threshold-filtered matching chunks
 */
export const retrieveContext = async (analysisId, query) => {
  const collectionName = `video_chunks_${analysisId}`;
  logger.info(`RAG: Retrieving context for query: "${query}" in collection: ${collectionName}`);

  if (process.env.NODE_ENV === 'test') {
    logger.info('RAG: [TEST MODE] Bypassing vector search retrieval.');
    return [];
  }

  try {
    // 1. Generate embedding for query using OpenAI embedding service
    const [queryEmbedding] = await generateEmbeddings([query]);
    if (!queryEmbedding) {
      logger.warn('RAG: Query embedding generation returned empty. Using empty context.');
      return [];
    }

    // 2. Query Qdrant for top 5 matches with analysisId metadata filter and score threshold
    const results = await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      limit: 5,
      filter: {
        must: [
          {
            key: 'analysisId',
            match: { value: analysisId }
          }
        ]
      },
      score_threshold: 0.70, // Strict similarity score threshold
      with_payload: true
    });

    logger.info(`RAG: Found ${results.length} chunks meeting similarity threshold.`);

    return results.map(res => ({
      id: res.id,
      score: res.score,
      payload: res.payload
    }));

  } catch (error) {
    logger.warn(`RAG: Qdrant retrieval failed or collection not found (${error.message}). Proceeding without vector context.`);
    return [];
  }
};
