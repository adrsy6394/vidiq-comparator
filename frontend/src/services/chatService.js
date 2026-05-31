import api from './api.js';

/**
 * Initialize a new chat session linked to an analysis
 * @param {string} analysisId 
 * @returns {Promise<object>} { success, sessionId }
 */
export const createChatSession = async (analysisId) => {
  const response = await api.post('/session', { analysisId });
  return response.data;
};

/**
 * Retrieve the full chat history of a session
 * @param {string} sessionId 
 * @returns {Promise<object>} { success, sessionId, analysisId, messages }
 */
export const fetchChatHistory = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}`);
  return response.data;
};

/**
 * Helper to execute SSE streaming POST fetch request
 * @param {string} analysisId 
 * @param {string} sessionId 
 * @param {string} message 
 * @returns {Promise<Response>} The native Fetch response containing the stream
 */
export const sendChatMessageStream = async (analysisId, sessionId, message) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  
  return fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysisId,
      sessionId,
      message,
    }),
  });
};
