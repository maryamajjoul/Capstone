import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

const SystemSettingsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        System Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>
          System configuration options will be displayed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SystemSettingsPage;