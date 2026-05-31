import axios from 'axios';

// Pull the base API url from Vite env or fallback to local port 3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second timeout standard
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
