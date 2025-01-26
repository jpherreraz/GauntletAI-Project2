import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@crm/shared/types';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await signOut();
  };

  // Redirect to appropriate landing page based on role
  React.useEffect(() => {
    if (location.pathname === '/') {
      const role = user?.user_metadata?.role;
      if (role === UserRole.CUSTOMER) {
        navigate(ROUTES.FAQ);
      } else if (role === UserRole.WORKER || role === UserRole.ADMIN) {
        navigate(ROUTES.TICKETS);
      }
    }
  }, [location.pathname, user?.user_metadata?.role, navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Support Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.user_metadata?.role === UserRole.CUSTOMER ? 'Customer' : 
               user?.user_metadata?.role === UserRole.WORKER ? 'Support Agent' : 
               user?.user_metadata?.role === UserRole.ADMIN ? 'Admin' : ''}
            </Typography>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar
                alt={`${user?.user_metadata.firstName} ${user?.user_metadata.lastName}`}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        {children}
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}; 