// src/services/userService.js
import apiClient from '../apiClient';

// Get all users
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get a user by ID
export const fetchUserById = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    await apiClient.delete(`/users/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};