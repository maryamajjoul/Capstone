// src/pages/IPManagementPage.jsx
import React, { useState } from 'react';
import { 
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const IPManagementPage = () => {
  // Sample IP data
  const [ipData] = useState([
    { id: 1, ip: '192.168.10.101' },
    { id: 2, ip: '127.0.0.1' }
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        IP Filter Management
      </Typography>

      {/* Top Buttons (mirroring RateLimitPage) */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<ListAltIcon />}
          sx={{ mr: 1 }}
          color="secondary"
        >
          List
        
        </Button>
        <Button
          variant="contained"
          startIcon={<StorageIcon />}
          sx={{ mr: 1 }}
          color="secondary"
        >
          Database
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ mr: 1 }}
          color="secondary"
        >
          Download
        </Button>
        <Button
          variant="contained"
          startIcon={<ShowChartIcon />}
          color="secondary"
        >
          Chart
        </Button>
      </Box>

      {/* Table (white Paper, similar to RateLimitPage) */}
      <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                id
                <Typography variant="caption" display="block">
                  [PK] bigint
                </Typography>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                ip
                <Typography variant="caption" display="block">
                  character varying (255)
                </Typography>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ipData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Bottom Buttons (mirroring RateLimitPage) */}
      <Box sx={{ display: 'flex', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mr: 1 }}
          color="success"
        >
          Add New IP
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete Selected
        </Button>
      </Box>
    </Box>
  );
};

export default IPManagementPage;
