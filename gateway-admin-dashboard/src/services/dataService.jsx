// src/services/dataService.js
import apiClient from 'src/apiClient';

// Get all routes
export const fetchRoutes = async () => {
  const response = await apiClient.get('/routes');
  return response.data;
};

// Add a new route
export const addRoute = async (routeData) => {
  const response = await apiClient.post('/routes', routeData);
  return response.data;
};

// Update a route by id
export const updateRoute = async (id, updatedData) => {
  const response = await apiClient.put(`/routes/${id}`, updatedData);
  return response.data;
};

// Delete a route by id
export const deleteRoute = async (id) => {
  const response = await apiClient.delete(`/routes/${id}`);
  return response.data;
};

// Similarly, add functions for other tables as needed, 
// like for IP management, rate limits, etc.
