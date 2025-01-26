import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from './layout/Navigation';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 