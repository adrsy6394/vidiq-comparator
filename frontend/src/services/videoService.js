import api from './api.js';

/**
 * Client-side Video Service
 * NOTE: Video details are fetched centrally through getAnalysisResult in analysisService.js.
 * This service acts as a placeholder for any direct video resource queries.
 */
export const getVideoDetailsPlaceholder = async (videoId) => {
  const response = await api.get(`/video/${videoId}`);
  return response.data;
};
