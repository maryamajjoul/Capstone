// src/pages/SystemSettingsPage.jsx
import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';   // axios instance used across the app

const SystemSettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 2. Clear any default Authorization header that might still be set
    if (apiClient && apiClient.defaults.headers.common.Authorization) {
      delete apiClient.defaults.headers.common.Authorization;
    }

    // 3. Redirect to the login page and force a full reload to flush in‑memory state
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Configuration
        </Typography>
        <Typography>System configuration options will be displayed here.</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Account Management
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Manage your account settings and security options.
        </Typography>

        <Button
          variant="contained"
          sx={{
            backgroundColor: 'red',
            '&:hover': { backgroundColor: '#c70000' },
            color: 'white',
            fontWeight: 'bold',
            mt: 2
          }}
          onClick={handleLogout}
        >
          LOG OUT
        </Button>
      </Paper>
    </Box>
  );
};

export default SystemSettingsPage;
