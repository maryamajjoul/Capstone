// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IPManagementPage from './pages/IPManagementPage.jsx';
import RateLimitPage from './pages/RateLimitPage.jsx';
import SystemSettingsPage from './pages/SystemSettingsPage.jsx';
import DashboardLayout from 'src/layout/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { fetchGatewayRoutes } from './services/dataService';

const App = () => {
  useEffect(() => {
    window.fetchGatewayRoutes = fetchGatewayRoutes;
  }, []);

  return (
    <Routes>
      {/* Public route for login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes wrapped in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ip-management" element={<IPManagementPage />} />
        <Route path="/rate-limits" element={<RateLimitPage />} />
        
        {/* System Settings page accessible by both roles, but will conditionally render user management */}
        <Route path="/system-settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Redirect any unknown paths */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;