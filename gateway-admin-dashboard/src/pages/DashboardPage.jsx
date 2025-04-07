// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Pagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { styled } from '@mui/material/styles';
import { fetchRoutes, addRoute, updateRoute, deleteRoute } from '../services/dataService';

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  height: '100%'
}));

const IconContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#e8f5e9',
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginRight: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const GreenIcon = styled(Box)({
  color: '#4caf50'
});

const DashboardPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest Modified');
  const [routes, setRoutes] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRoutes: 0,
    requestsThisMonth: 0,
    requestsGrowth: 0,
    authorizedPersonnel: 0
  });
  
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({
    predicate: '',
    uri: '',
    withTokenFilter: false,
    withRateLimitFilter: false,
    withIpFilter: false
  });

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [routeToUpdate, setRouteToUpdate] = useState(null);

  const loadRoutes = async () => {
    try {
      const data = await fetchRoutes();
      setRoutes(data);
      setMetrics({
        totalRoutes: data.length,
        requestsThisMonth: data.reduce((sum, route) => sum + (route.requests || 0), 0),
        requestsGrowth: 15,
        authorizedPersonnel: 25
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const filteredRoutes = routes.filter((route) =>
    JSON.stringify(route).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredRoutes.slice(startIndex, startIndex + itemsPerPage);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewRoute({
      predicate: '',
      uri: '',
      withTokenFilter: false,
      withRateLimitFilter: false,
      withIpFilter: false
    });
  };

  const handleNewRouteChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoute((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitAddRoute = async () => {
    try {
      await addRoute(newRoute);
      await loadRoutes();
      handleCloseAddModal();
    } catch (error) {
      console.error('Error adding route:', error);
    }
  };

  const handleOpenUpdateModal = (route) => {
    setRouteToUpdate(route);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setRouteToUpdate(null);
  };

  const handleUpdateRouteChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRouteToUpdate((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitUpdateRoute = async () => {
    try {
      await updateRoute(routeToUpdate.id, routeToUpdate);
      await loadRoutes();
      handleCloseUpdateModal();
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      await deleteRoute(id);
      await loadRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: 250 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenAddModal}
            sx={{ textTransform: 'none' }}
          >
            Add New Route
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <MetricCard elevation={0}>
            <IconContainer>
              <GreenIcon>
                <PeopleOutlineIcon />
              </GreenIcon>
            </IconContainer>
            <Box>
              <Typography color="textSecondary" variant="subtitle2">
                Total Routes
              </Typography>
              <Typography variant="h4">
                {metrics.totalRoutes}
              </Typography>
            </Box>
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard elevation={0}>
            <IconContainer>
              <GreenIcon>
                <PersonOutlineIcon />
              </GreenIcon>
            </IconContainer>
            <Box>
              <Typography color="textSecondary" variant="subtitle2">
                Requests This Month
              </Typography>
              <Typography variant="h4">
                {metrics.requestsThisMonth}
                <Typography 
                  component="span" 
                  variant="caption"
                  sx={{ 
                    color: 'success.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    ml: 1
                  }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                  {metrics.requestsGrowth}% this month
                </Typography>
              </Typography>
            </Box>
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard elevation={0}>
            <IconContainer>
              <GreenIcon>
                <ComputerIcon />
              </GreenIcon>
            </IconContainer>
            <Box>
              <Typography color="textSecondary" variant="subtitle2">
                Authorised Personnel
              </Typography>
              <Typography variant="h4">
                {metrics.authorizedPersonnel}
              </Typography>
            </Box>
          </MetricCard>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">All Routes</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mr: 2, width: 200 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Sort by:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {sortBy} ▼
              </Typography>
            </Box>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Predicate</TableCell>
                <TableCell>URI</TableCell>
                <TableCell>WithTokenFilter</TableCell>
                <TableCell>WithRateLimitFilter</TableCell>
                <TableCell>WithIpFilter</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.id}</TableCell>
                  <TableCell>{route.predicate}</TableCell>
                  <TableCell>{route.uri}</TableCell>
                  <TableCell>{route.withTokenFilter ? 'True' : 'False'}</TableCell>
                  <TableCell>{route.withRateLimitFilter ? 'True' : 'False'}</TableCell>
                  <TableCell>{route.withIpFilter ? 'True' : 'False'}</TableCell>
                  <TableCell>{route.ipAddresses ? route.ipAddresses.join(', ') : ''}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      sx={{ mr: 1, textTransform: 'none' }}
                      onClick={() => handleOpenUpdateModal(route)}
                    >
                      Update
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      size="small"
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleDeleteRoute(route.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            Showing data 1 to {currentItems.length} of {filteredRoutes.length} entries
          </Typography>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handleChangePage} 
            color="primary" 
            showFirstButton 
            showLastButton 
          />
        </Box>
      </Box>

      {/* Add New Route Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle>Add New Route</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Predicate"
            name="predicate"
            value={newRoute.predicate}
            onChange={handleNewRouteChange}
            fullWidth
          />
          <TextField
            label="URI"
            name="uri"
            value={newRoute.uri}
            onChange={handleNewRouteChange}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="With Token Filter (true/false)"
              name="withTokenFilter"
              value={newRoute.withTokenFilter}
              onChange={handleNewRouteChange}
              fullWidth
            />
            <TextField
              label="With Rate Limit Filter (true/false)"
              name="withRateLimitFilter"
              value={newRoute.withRateLimitFilter}
              onChange={handleNewRouteChange}
              fullWidth
            />
            <TextField
              label="With IP Filter (true/false)"
              name="withIpFilter"
              value={newRoute.withIpFilter}
              onChange={handleNewRouteChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSubmitAddRoute} variant="contained" sx={{ textTransform: 'none' }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Route Modal */}
      <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal}>
        <DialogTitle>Update Route</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {routeToUpdate && (
            <>
              <TextField
                label="Predicate"
                name="predicate"
                value={routeToUpdate.predicate}
                onChange={handleUpdateRouteChange}
                fullWidth
              />
              <TextField
                label="URI"
                name="uri"
                value={routeToUpdate.uri}
                onChange={handleUpdateRouteChange}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="With Token Filter (true/false)"
                  name="withTokenFilter"
                  value={routeToUpdate.withTokenFilter}
                  onChange={handleUpdateRouteChange}
                  fullWidth
                />
                <TextField
                  label="With Rate Limit Filter (true/false)"
                  name="withRateLimitFilter"
                  value={routeToUpdate.withRateLimitFilter}
                  onChange={handleUpdateRouteChange}
                  fullWidth
                />
                <TextField
                  label="With IP Filter (true/false)"
                  name="withIpFilter"
                  value={routeToUpdate.withIpFilter}
                  onChange={handleUpdateRouteChange}
                  fullWidth
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateModal} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSubmitUpdateRoute} variant="contained" sx={{ textTransform: 'none' }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
