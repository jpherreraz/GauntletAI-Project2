import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@crm/shared/types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === UserRole.ADMIN;
  const isWorker = user?.user_metadata?.role === UserRole.WORKER;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome{user?.user_metadata?.firstName ? `, ${user.user_metadata.firstName}!` : '!'}
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Open Tickets
            </Typography>
            <Typography component="p" variant="h4">
              0
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Awaiting response
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              In Progress
            </Typography>
            <Typography component="p" variant="h4">
              0
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Being handled
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Resolved Today
            </Typography>
            <Typography component="p" variant="h4">
              0
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Successfully completed
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Recent Activity" />
            <CardContent>
              <Typography color="text.secondary">
                No recent activity to display.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin/Worker Only Sections */}
        {(isAdmin || isWorker) && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Team Performance" />
              <CardContent>
                <Typography color="text.secondary">
                  Performance metrics will be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Admin Only Section */}
        {isAdmin && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="System Overview" />
              <CardContent>
                <Typography color="text.secondary">
                  System metrics and statistics will be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 