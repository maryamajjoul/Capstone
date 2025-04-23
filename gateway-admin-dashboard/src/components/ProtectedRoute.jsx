// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// requiredRole prop is optional. If provided, it checks if the user has that specific role.
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading, hasRole } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    // Optional: Show a loading indicator while auth state is being determined
    return <div>Loading Authentication...</div>;
  }

  if (!isAuthenticated) {
    // User not logged in, redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required for this route
  if (requiredRole && !hasRole(requiredRole)) {
    // User is logged in but doesn't have the required role
    console.warn(`User ${user?.username} does not have required role: ${requiredRole}`);
    // Redirect to a safe page, like the dashboard, or show an unauthorized message
    // Avoid infinite redirects if the dashboard itself requires a role they don't have.
    // Consider a dedicated "/unauthorized" page or just redirecting to dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has the required role (if specified)
  return children;
};

export default ProtectedRoute;