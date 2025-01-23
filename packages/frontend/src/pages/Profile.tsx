import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography>
        Welcome, {user?.user_metadata.firstName} {user?.user_metadata.lastName}!
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Profile management functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default Profile; 