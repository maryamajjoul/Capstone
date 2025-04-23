// src/apiClient.jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Will use Vite's proxy configuration
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token expiration and other auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
      
      // Handle 403 Forbidden - insufficient permissions
      if (error.response.status === 403) {
        console.error('Permission denied:', error.response.data);
        // Optionally redirect to dashboard or show a notification
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;