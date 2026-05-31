import { qdrantClient } from '../vector/qdrantClient.js';
import { createCollectionIfNotExists } from '../vector/collectionManager.js';
import { chunkTranscript, generateEmbeddings } from './embeddingService.js';
import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * Chunk, embed, and upsert transcript segments into a Qdrant collection.
 * 
 * @param {string} analysisId 
 * @param {string} videoId 
 * @param {string} platform - 'youtube' | 'instagram'
 * @param {Array<{text: string, start: number, duration: number}>} segments 
 * @returns {Promise<void>}
 */
export const upsertTranscriptChunks = async (analysisId, videoId, platform, segments) => {
  const collectionName = `video_chunks_${analysisId}`;
  logger.info(`Starting vector indexing for ${platform} video: ${videoId} in collection: ${collectionName}`);
  
  try {
    // 1. Ensure collection exists
    await createCollectionIfNotExists(collectionName);

    // 2. Chunk transcript segments
    const chunks = chunkTranscript(segments);
    if (chunks.length === 0) {
      logger.warn(`No segments found to index for video ${videoId}. Skipping vector upsert.`);
      return;
    }

    // 3. Generate embeddings
    const texts = chunks.map(c => c.text);
    const embeddings = await generateEmbeddings(texts);

    // 4. Formulate points
    const points = chunks.map((chunk, index) => ({
      id: randomUUID(),
      vector: embeddings[index],
      payload: {
        analysisId,
        videoId,
        platform,
        chunkIndex: index,
        text: chunk.text,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        wordCount: chunk.text.split(/\s+/).length
      }
    }));

    // 5. Upsert into Qdrant
    await qdrantClient.upsert(collectionName, {
      wait: true,
      points
    });

    logger.info(`Successfully indexed ${points.length} chunks in Qdrant for video: ${videoId}`);
  } catch (error) {
    logger.error(`Error in upsertTranscriptChunks for video ${videoId}: ${error.message}`);
    throw error;
  }
};

/**
 * Query top-k similar chunks filtered by analysisId
 * @param {string} analysisId 
 * @param {number[]} queryEmbedding 
 * @param {number} topK 
 * @returns {Promise<Array<object>>} search results
 */
export const querySimilarChunks = async (analysisId, queryEmbedding, topK = 5) => {
  const collectionName = `video_chunks_${analysisId}`;
  logger.info(`Searching Qdrant collection: ${collectionName} with topK: ${topK}`);
  
  try {
    const results = await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      limit: topK,
      filter: {
        must: [
          {
            key: 'analysisId',
            match: { value: analysisId }
          }
        ]
      },
      with_payload: true
    });

    return results.map(res => ({
      id: res.id,
      score: res.score,
      payload: res.payload
    }));
  } catch (error) {
    logger.error(`Error searching Qdrant collection ${collectionName}: ${error.message}`);
    throw error;
  }
};
