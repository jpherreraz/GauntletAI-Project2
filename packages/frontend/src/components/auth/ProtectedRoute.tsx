import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '@crm/shared/constants';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.user_metadata.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}; 