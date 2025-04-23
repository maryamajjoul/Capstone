// src/layout/DashboardLayout.jsx
import React, { useContext } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import HexagonOutlinedIcon from '@mui/icons-material/HexagonOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { AuthContext } from '../context/AuthContext';

const Sidebar = styled(Box)(({ theme }) => ({
  width: 260,
  backgroundColor: '#FFFFFF',
  height: '100vh',
  padding: theme.spacing(3),
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column'
}));

const SidebarHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '2rem'
});

const NavItem = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  backgroundColor: active ? '#FF914D' : 'transparent',
  color: active ? '#FFFFFF' : 'black',
  '&:hover': {
    backgroundColor: active ? '' : '#FF914D',
  }
}));

const NavIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5)
}));

const Content = styled(Box)({
  flexGrow: 1,
  backgroundColor: '#F5F7FA',
  height: '100vh',
  overflow: 'auto'
});

const UserInfo = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(2),
  borderTop: '1px solid #f0f0f0',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5)
}));

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useContext(AuthContext);
  
  // Base navigation items (accessible by both roles)
  const navItems = [
    { 
      label: 'Dashboard', 
      icon: <DashboardOutlinedIcon />, 
      path: '/dashboard' 
    },
    { 
      label: 'Rate Limits', 
      icon: <SpeedOutlinedIcon />, 
      path: '/rate-limits' 
    },
    { 
      label: 'IP Management', 
      icon: <ComputerOutlinedIcon />, 
      path: '/ip-management' 
    },
    { 
      label: 'System Settings', 
      icon: <SettingsOutlinedIcon />, 
      path: '/system-settings' 
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <Box display="flex">
      <Sidebar>
        <SidebarHeader>
          <HexagonOutlinedIcon sx={{ fontSize: '2rem', mr: 1 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Dashboard
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Gateway Admin
            </Typography>
          </Box>
        </SidebarHeader>

        {navItems.map((item) => (
          <NavItem 
            key={item.label} 
            active={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
          >
            <NavIcon>
              {item.icon}
            </NavIcon>
            <Typography sx={{ flexGrow: 1 }}>
              {item.label}
            </Typography>
            {item.label !== 'Dashboard' && (
              <KeyboardArrowRightIcon fontSize="small" />
            )}
          </NavItem>
        ))}
        
        {/* User info at bottom of sidebar */}
        <UserInfo>
          <Typography fontWeight="bold">{user?.username || 'User'}</Typography>
          <Typography variant="caption" color="textSecondary">
            Role: {isAdmin ? 'Administrator' : 'Standard User'}
          </Typography>
        </UserInfo>
      </Sidebar>
      
      <Content>
        <Outlet />
      </Content>
    </Box>
  );
};

export default DashboardLayout;