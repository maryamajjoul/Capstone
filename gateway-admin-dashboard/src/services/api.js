import axios from 'axios';

// Rely on Vite proxy to forward /api to http://localhost:9080
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
