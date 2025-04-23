// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading,       setIsLoading]       = useState(true);
  const [user,            setUser]            = useState(null);

  // Rehydrate on mount
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    if (token && userData) {
      console.log('[Auth] rehydrated user:', userData);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('[Auth] login()', { username, password: password ? '••••••' : '(empty)' } );
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      console.log('[Auth] response:', response.status, response.data);

      if (response.status === 200 && response.data.token) {
        const { token, username: uname, roles } = response.data;

        // Store and set header
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Store user data
        const userData = { username: uname, roles };
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);

        setIsAuthenticated(true);
        return true;
      } else {
        console.warn('[Auth] login succeeded but no token in response:', response.data);
        return false;
      }
    } catch (err) {
      if (err.response) {
        console.error(
          '[Auth] login error:',
          'status=', err.response.status,
          'data=', err.response.data
        );
      } else {
        console.error('[Auth] login unexpected error:', err);
      }
      return false;
    }
  };

  const logout = () => {
    console.log('[Auth] logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete apiClient.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      hasRole,
      isAdmin: hasRole('ROLE_ADMIN'),
    }}>
      {children}
    </AuthContext.Provider>
  );
};
