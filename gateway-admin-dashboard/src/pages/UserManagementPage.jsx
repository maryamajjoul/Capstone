// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
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
  Button,
  Pagination,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/userService';

const TableContainerStyled = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));

const ITEMS_PER_PAGE = 5;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [openAdd, setOpenAdd] = useState(false);
  const [addForm, setAddForm] = useState({ username: '', password: '', role: 'USER' });

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState({ id: null, username: '', password: '', role: '' });

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      setError('Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadUsers(); 
  }, []);

  // Filter, sort and paginate users
  const filtered = users.filter(user =>
    `${user.id} ${user.username} ${user.role}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // CRUD actions
  const handleAdd = async () => {
    if (!addForm.username || !addForm.password) {
      alert('Username and password are required');
      return;
    }
    try {
      await createUser(addForm);
      setOpenAdd(false);
      setAddForm({ username: '', password: '', role: 'USER' });
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to add user');
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.username) {
      alert('Username cannot be empty');
      return;
    }
    try {
      await updateUser(updateForm.id, updateForm);
      setOpenUpdate(false);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to delete user');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">User Management</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {/* Search + Add */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
        <TextField
          placeholder="Search"
          size="small"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ width: 280 }}
        />
        <Button variant="contained" onClick={() => setOpenAdd(true)} sx={{ textTransform: 'none' }}>
          Add New User
        </Button>
      </Box>

      {/* Table */}
      <TableContainerStyled component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : paginated.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No users found</TableCell></TableRow>
            ) : (
              paginated.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" color="success" sx={{ mr: 1, textTransform: 'none' }}
                      onClick={() => { 
                        setUpdateForm({ 
                          id: user.id, 
                          username: user.username, 
                          password: '', // Empty password, will only be updated if provided
                          role: user.role 
                        }); 
                        setOpenUpdate(true); 
                      }}>
                      Update
                    </Button>
                    <Button size="small" variant="contained" color="error" sx={{ textTransform: 'none' }}
                      onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainerStyled>

      <Pagination page={page} count={totalPages} onChange={(_, v) => setPage(v)} sx={{ mt: 2 }} />

      {/* Add Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label="Username" 
            fullWidth 
            value={addForm.username} 
            onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))} 
          />
          <TextField 
            label="Password" 
            type="password" 
            fullWidth 
            value={addForm.password} 
            onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} 
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={addForm.role}
              label="Role"
              onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={openUpdate} onClose={() => setOpenUpdate(false)}>
        <DialogTitle>Update User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label="Username" 
            fullWidth 
            value={updateForm.username} 
            onChange={e => setUpdateForm(p => ({ ...p, username: e.target.value }))} 
          />
          <TextField 
            label="Password (leave empty to keep current)" 
            type="password" 
            fullWidth 
            value={updateForm.password} 
            onChange={e => setUpdateForm(p => ({ ...p, password: e.target.value }))} 
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={updateForm.role}
              label="Role"
              onChange={e => setUpdateForm(p => ({ ...p, role: e.target.value }))}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdate(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;