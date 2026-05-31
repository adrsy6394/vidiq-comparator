import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '../config/env.js';

// Instantiate the Qdrant Client using config settings
export const qdrantClient = new QdrantClient({
  url: env.QDRANT_URL,
  apiKey: env.QDRANT_API_KEY || undefined,
});
