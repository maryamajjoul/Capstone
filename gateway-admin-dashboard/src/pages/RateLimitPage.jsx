// src/pages/RateLimitPage.jsx
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
import ListAltIcon from '@mui/icons-material/ListAlt';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';

const RateLimitPage = () => {
  const [rateLimitData] = useState([
    { id: 1, max_requests: 100, time_window_ms: 60000 },
    { id: 2, max_requests: 10, time_window_ms: 60000 }
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Rate Limit Management
      </Typography>

      <Box sx={{ display: 'flex', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<ListAltIcon />}
          sx={{ mr: 1 }}
          color="secondary"  // Uses black from theme
        >
          List
        </Button>
        
        <Button
          variant="contained"
          startIcon={<StorageIcon />}
          sx={{ mr: 1 }}
          color="secondary"  // Uses black from theme
        >
          Database
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ mr: 1 }}
          color="secondary"  // Uses black from theme
        >
          Download
        </Button>
        <Button
          variant="contained"
          startIcon={<ShowChartIcon />}
          color="secondary"  // Uses black from theme
        >
          Chart
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                max_requests
                <Typography variant="caption" display="block">
                  integer
                </Typography>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                time_window_ms
                <Typography variant="caption" display="block">
                  integer
                </Typography>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                id
                <Typography variant="caption" display="block">
                  [PK] bigint
                </Typography>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rateLimitData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.max_requests}</TableCell>
                <TableCell>{row.time_window_ms}</TableCell>
                <TableCell>{row.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', mt: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ mr: 1 }}
          color="success"  // Uses black from theme
        >
          Add New Rate Limit
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

export default RateLimitPage;
