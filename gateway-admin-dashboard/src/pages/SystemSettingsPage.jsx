 // src/pages/SystemSettingsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Typography, Box, Paper, Button, Tabs, Tab, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Snackbar, Alert, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// Import user service functions directly if not using a central api service file
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/userService';

// TabPanel component (keep as is)
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, logout, user: currentUser } = useContext(AuthContext); // Get current logged-in user

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // --- User Management State (Moved from UserManagementPage) ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFormLoading, setUserFormLoading] = useState(false); // For dialog actions
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // User being edited
  const [formData, setFormData] = useState({
    username: '',
    password: '', // Keep separate for add/edit logic
    role: 'ROLE_USER', // Default role
    enabled: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // --- End User Management State ---

  // Load users function
  const loadUsers = useCallback(async () => {
    if (!isAdmin) return; // Should not be called if not admin, but double-check
    setLoadingUsers(true);
    try {
      const data = await fetchUsers();
      setUsers(data || []); // Ensure users is always an array
    } catch (error) {
      console.error('Error loading users:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load users',
        severity: 'error'
      });
      setUsers([]); // Set to empty array on error
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]); // Dependency on isAdmin

  // Load users when the User Management tab is selected (and user is admin)
  useEffect(() => {
    if (isAdmin && tabValue === 1) {
      loadUsers();
    }
  }, [isAdmin, tabValue, loadUsers]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // --- User Management Dialog and Form Handlers ---
  const handleOpenAddUserDialog = () => {
    setFormData({ username: '', password: '', role: 'ROLE_USER', enabled: true });
    setFormErrors({});
    setSelectedUser(null);
    setOpenAddUserDialog(true);
  };

  const handleOpenEditUserDialog = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      password: '', // Clear password field for edit
      role: userToEdit.role,
      enabled: userToEdit.enabled
    });
    setFormErrors({});
    setOpenEditUserDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddUserDialog(false);
    setOpenEditUserDialog(false);
    setSelectedUser(null); // Clear selected user on close
    setFormData({ username: '', password: '', role: 'ROLE_USER', enabled: true }); // Reset form
    setFormErrors({}); // Reset errors
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!formData.username?.trim()) errors.username = 'Username is required';
    // Password required only for new users, optional for edits
    if (!isEdit && !formData.password?.trim()) {
      errors.password = 'Password is required for new users';
    } else if (formData.password?.trim() && formData.password.length < 6) {
        // Optional: Add password complexity rules
        errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.role) errors.role = 'Role is required';
    // Cannot disable the currently logged-in user or change their role to non-admin if they are the only admin? (complex rules - omit for now)

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // True if no errors
  };

  const handleAddUser = async () => {
    if (!validateForm(false)) return;
    setUserFormLoading(true);
    try {
      // Prepare data: ensure 'enabled' is boolean if needed by backend
      const payload = { ...formData, enabled: formData.enabled };
      await createUser(payload);
      setSnackbar({ open: true, message: 'User added successfully', severity: 'success' });
      handleCloseDialog();
      await loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error adding user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add user',
        severity: 'error'
      });
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !validateForm(true)) return;
    setUserFormLoading(true);
    try {
      // Prepare data: Backend might ignore password if empty/null
      const payload = {
        username: formData.username,
        role: formData.role,
        enabled: formData.enabled,
        // Only include password if it's not empty
        ...(formData.password?.trim() && { password: formData.password })
      };
      await updateUser(selectedUser.id, payload);
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      handleCloseDialog();
      await loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update user',
        severity: 'error'
      });
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
     // Prevent deleting the currently logged-in user
     if (currentUser?.username === username) {
         setSnackbar({ open: true, message: 'Cannot delete the currently logged-in user.', severity: 'warning' });
         return;
     }

    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;
    setLoadingUsers(true); // Use main loading indicator while deleting
    try {
      await deleteUser(userId);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      await loadUsers(); // Refresh the list (will finish loading state)
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete user',
        severity: 'error'
      });
       setLoadingUsers(false); // Ensure loading stops on error
    }
    // No finally setLoading(false) here, loadUsers() handles it
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  // --- End User Management Handlers ---


  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      <Paper elevation={2}> {/* Wrap tabs in paper for better visual separation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="System Settings Tabs">
            <Tab label="General" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
            {/* Conditionally render User Management Tab */}
            {isAdmin && <Tab label="User Management" id="simple-tab-1" aria-controls="simple-tabpanel-1" />}
          </Tabs>
        </Box>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, mb: 3, border: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Application Information
            </Typography>
            <Typography>
              Gateway administration dashboard for managing routes, rate limits, IP filtering, and users.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, border: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Account Actions
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Logged in as: <strong>{currentUser?.username}</strong> ({isAdmin ? 'Administrator' : 'User'})
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </Paper>
        </TabPanel>

        {/* User Management Tab (Admin only) */}
        {isAdmin && (
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Manage User Accounts</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddUserDialog}
                disabled={loadingUsers}
              >
                Add New User
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table sx={{ minWidth: 650 }} aria-label="user management table">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        hover
                      >
                        <TableCell component="th" scope="row">{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}
                        </TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              bgcolor: user.enabled ? 'success.main' : 'error.main',
                              color: 'common.white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '12px', // Pill shape
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                              display: 'inline-block',
                              lineHeight: 1,
                            }}
                          >
                            {user.enabled ? 'Active' : 'Disabled'}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditUserDialog(user)}
                              sx={{ mr: 0.5 }}
                              aria-label={`edit user ${user.username}`}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            {/* Disable delete button for the current user */}
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              disabled={currentUser?.username === user.username}
                              aria-label={`delete user ${user.username}`}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        )}
      </Paper> {/* End Tabs Paper */}


      {/* Add User Dialog */}
      <Dialog open={openAddUserDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={userFormLoading}
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={userFormLoading}
            />
            <FormControl fullWidth error={!!formErrors.role} disabled={userFormLoading}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <MenuItem value="ROLE_USER">User</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrator</MenuItem>
              </Select>
              {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
            </FormControl>
             {/* Enabled status - maybe default to true and hide for add? Or use a Switch */}
             {/* <FormControlLabel control={<Switch checked={formData.enabled} onChange={handleInputChange} name="enabled" />} label="Enabled" disabled={userFormLoading}/> */}

          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={userFormLoading}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" disabled={userFormLoading}>
            {userFormLoading ? <CircularProgress size={24} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditUserDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={userFormLoading}
            />
            <TextField
              margin="dense"
              label="New Password (optional)"
              type="password"
              fullWidth
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password || "Leave blank to keep current password"}
              disabled={userFormLoading}
              autoComplete="new-password" // Help browser distinguish
            />
            <FormControl fullWidth error={!!formErrors.role} disabled={userFormLoading || currentUser?.username === selectedUser?.username /* Prevent self-role change */}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <MenuItem value="ROLE_USER">User</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrator</MenuItem>
              </Select>
              {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth disabled={userFormLoading || currentUser?.username === selectedUser?.username /* Prevent self-disable */}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="enabled"
                value={formData.enabled} // Use boolean directly
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.value === 'true' }))} // Convert string back to boolean
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={userFormLoading}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={userFormLoading}>
            {userFormLoading ? <CircularProgress size={24} /> : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Centered is often better
      >
        {/* Ensure Alert is imported */}
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettingsPage;