// src/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Assumes you have set up a proxy in Vite to forward /api to your backend
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (optional: attach auth tokens here if needed)
apiClient.interceptors.request.use(
  (config) => {
    // Example: Uncomment and modify if you have an auth token stored in localStorage
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API call error:', error);
    // Optionally handle specific error statuses here
    return Promise.reject(error);
  }
);

export default apiClient;
