import { qdrantClient } from './qdrantClient.js';
import logger from '../utils/logger.js';

/**
 * Check if a collection exists in Qdrant database
 * @param {string} collectionName 
 * @returns {Promise<boolean>}
 */
export const collectionExists = async (collectionName) => {
  try {
    const result = await qdrantClient.getCollections();
    const names = result.collections.map(col => col.name);
    return names.includes(collectionName);
  } catch (error) {
    logger.error(`Error checking collection existence for ${collectionName}: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new collection in Qdrant with Cosine similarity and 1536-dimensions (OpenAI embedding length)
 * @param {string} collectionName 
 * @returns {Promise<void>}
 */
export const createCollectionIfNotExists = async (collectionName) => {
  try {
    const exists = await collectionExists(collectionName);
    if (exists) {
      logger.info(`Qdrant Collection already exists: ${collectionName}`);
      return;
    }

    logger.info(`Creating Qdrant Collection: ${collectionName}`);
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: 1536, // Dimension of OpenAI text-embedding-3-small
        distance: 'Cosine'
      }
    });
    logger.info(`Successfully created collection: ${collectionName}`);
  } catch (error) {
    logger.error(`Failed to create Qdrant collection ${collectionName}: ${error.message}`);
    throw error;
  }
};

/**
 * Delete/Drop a Qdrant collection
 * @param {string} collectionName 
 * @returns {Promise<void>}
 */
export const deleteCollection = async (collectionName) => {
  try {
    const exists = await collectionExists(collectionName);
    if (!exists) {
      logger.info(`Qdrant collection ${collectionName} does not exist. Bypassing delete.`);
      return;
    }

    logger.info(`Deleting Qdrant collection: ${collectionName}`);
    await qdrantClient.deleteCollection(collectionName);
    logger.info(`Successfully deleted collection: ${collectionName}`);
  } catch (error) {
    logger.error(`Failed to delete Qdrant collection ${collectionName}: ${error.message}`);
    throw error;
  }
};
