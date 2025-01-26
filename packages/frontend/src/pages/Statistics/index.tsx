import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTickets } from '../../hooks/useTickets';
import { TicketStatus } from '@crm/shared/types/ticket';

const Statistics: React.FC = () => {
  const { data: tickets, isLoading } = useTickets();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recentlyUpdatedTickets = tickets?.filter(
    (ticket) => new Date(ticket.updated_at) >= today
  ).length || 0;

  const stats = {
    total: tickets?.length || 0,
    pending: tickets?.filter((ticket) => ticket.status === "pending").length || 0,
    in_progress: tickets?.filter((ticket) => ticket.status === "in_progress").length || 0,
    resolved: tickets?.filter((ticket) => ticket.status === "resolved").length || 0,
    recentlyUpdated: recentlyUpdatedTickets,
    unassigned: tickets?.filter((ticket) => !ticket.assignee_id).length || 0,
    urgent: tickets?.filter((ticket) => ticket.priority === "urgent").length || 0,
    high: tickets?.filter((ticket) => ticket.priority === "high").length || 0,
    medium: tickets?.filter((ticket) => ticket.priority === "medium").length || 0,
    low: tickets?.filter((ticket) => ticket.priority === "low").length || 0,
  };

  const StatCard = ({ title, value }: { title: string; value: number }) => (
    <Grid item xs={12} md={4}>
      <Paper
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h3" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <Typography color="text.secondary" variant="subtitle1">
          {title}
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Ticket Statistics
      </Typography>

      <Grid container spacing={3}>
        <StatCard title="Total Tickets" value={stats.total} />
        <StatCard title="Pending Tickets" value={stats.pending} />
        <StatCard title="In Progress" value={stats.in_progress} />
        <StatCard title="Resolved" value={stats.resolved} />
        <StatCard title="Recently Updated" value={stats.recentlyUpdated} />
        <StatCard title="Unassigned" value={stats.unassigned} />
        <StatCard title="Urgent" value={stats.urgent} />
        <StatCard title="High Priority" value={stats.high} />
        <StatCard title="Medium Priority" value={stats.medium} />
        <StatCard title="Low Priority" value={stats.low} />
      </Grid>
    </Box>
  );
};

export default Statistics; 