// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username, password) => {
    try {
      console.log("Attempting login with:", username, password);
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      // POST directly to the backend login endpoint
      const response = await axios.post('http://localhost:9080/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });
      console.log("Login response:", response.data);
      if (response.status === 200 && !response.data.includes("Please sign in")) {
        setIsAuthenticated(true);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
