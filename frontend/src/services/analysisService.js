import api from './api.js';

/**
 * Trigger background comparison job for a YouTube and Instagram video
 * @param {string} youtubeUrl 
 * @param {string} instagramUrl 
 * @returns {Promise<object>} { success, analysisId, jobId, message }
 */
export const submitAnalysis = async (youtubeUrl, instagramUrl) => {
  const response = await api.post('/analyze', { youtubeUrl, instagramUrl });
  return response.data;
};

/**
 * Poll active step progress and milestones status for a queued job
 * @param {string} jobId 
 * @returns {Promise<object>} active progress details
 */
export const getAnalysisStatus = async (jobId) => {
  const response = await api.get(`/status/${jobId}`);
  return response.data;
};

/**
 * Retrieve the complete comparative results and metrics of a finished analysis
 * @param {string} analysisId 
 * @returns {Promise<object>} normalized analysis details
 */
export const getAnalysisResult = async (analysisId) => {
  const response = await api.get(`/analysis/${analysisId}`);
  return response.data;
};
