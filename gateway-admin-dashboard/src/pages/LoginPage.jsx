import React, { useState, useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

const LoginPage = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { if (error) setError(''); }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setIsSubmitting(true);
    const success = await login(username, password);
    setIsSubmitting(false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <Box sx={{ display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',bgcolor:'#f5f5f5' }}>
      <Paper elevation={3} sx={{p:4,width:'100%',maxWidth:400, borderRadius:2}}>
        <Typography variant="h4" textAlign="center" gutterBottom>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Username" fullWidth margin="normal"
            value={username} onChange={e=>setUsername(e.target.value)} disabled={isSubmitting} autoFocus />
          <TextField label="Password" type="password" fullWidth margin="normal"
            value={password} onChange={e=>setPassword(e.target.value)} disabled={isSubmitting} />
          {error && <Typography color="error" variant="body2" sx={{mt:2}}>{error}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{mt:3,mb:2,py:1.5}} disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
