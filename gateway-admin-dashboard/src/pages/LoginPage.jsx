// src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login; default to "/dashboard"
  const from = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

   // If already authenticated, redirect immediately
   if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div style={{ margin: '2rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '300px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username</label>
          <br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;