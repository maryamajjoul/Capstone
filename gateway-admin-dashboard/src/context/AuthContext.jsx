// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Try both approaches - Basic auth and form submission
      let response;
      try {
        // First try with Basic Auth
        response = await axios.get("http://localhost:8081/api/auth/login", {
          auth: {
            username,
            password,
          },
        });
      } catch (err) {
        // If that fails, try with form submission
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        response = await axios.post("http://localhost:9080/login", formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      }
      
      if (response.status === 200) {
        // Store token if provided in the response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};