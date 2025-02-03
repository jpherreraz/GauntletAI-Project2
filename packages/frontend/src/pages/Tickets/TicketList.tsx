import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Lock as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTickets, useUpdateTicket } from '../../hooks/useTickets';
import { useWorkers } from '../../hooks/useWorkers';
import { ROUTES } from '@crm/shared/constants';
import { TicketStatus } from '@crm/shared/types/ticket';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, User } from '@crm/shared/types/user';
import { useProfile } from '../../hooks/useProfile';

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
} as const;

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateTicket = useUpdateTicket();
  const { data: workers } = useWorkers();
  const { data: userProfileData, isLoading: isLoadingProfile, error: profileError } = useProfile(user?.id);

  // Get the first item from the array since get_user_profile returns a single row
  const userProfile = userProfileData?.[0];
  const role = userProfile?.role?.toLowerCase();
  const isCustomer = role === 'customer';
  const isWorker = role === 'worker';
  const isAdmin = role === 'admin';

  console.log('TicketList: User data:', {
    user,
    userProfile,
    role,
    isCustomer,
    isWorker,
    isAdmin,
    profileError
  });

  const { data: tickets, isLoading: isLoadingTickets, error: ticketsError } = useTickets({
    customerId: isCustomer ? user?.id : undefined,
  });

  // Show loading state while profile or tickets are loading
  if (isLoadingProfile || isLoadingTickets) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state if there's an error loading profile or tickets
  if (profileError || ticketsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {profileError ? 'Error loading user profile' : 'Error loading tickets'}
        </Alert>
      </Box>
    );
  }

  // Show message if no role is assigned
  if (!role) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Your user account is not properly configured. Please contact support.
        </Alert>
      </Box>
    );
  }

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateTicket.mutateAsync({
        id: ticketId,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleAssigneeChange = async (ticketId: string, workerId: string | null) => {
    try {
      console.log('Updating assignee:', { ticketId, workerId });
      await updateTicket.mutateAsync({
        id: ticketId,
        assignee_id: workerId,
      });
    } catch (error) {
      console.error('Failed to update ticket assignee:', error);
    }
  };

  const canViewTicket = (ticket: any) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (isCustomer) return ticket.customer_id === user.id;
    if (isWorker) return true;
    return false;
  };

  const canOpenTicket = (ticket: any) => {
    console.log('canOpenTicket check:', {
      user,
      role,
      isCustomer: role === 'customer',
      isWorker: role === 'worker',
      isAdmin: role === 'admin',
      ticketCustomerId: ticket.customer_id,
      userId: user?.id,
    });

    if (!user || !role) {
      console.log('canOpenTicket: No user or role found');
      return false;
    }
    if (role === 'admin') {
      console.log('canOpenTicket: User is admin');
      return true;
    }
    if (role === 'customer') {
      const canOpen = ticket.customer_id === user.id;
      console.log('canOpenTicket: User is customer', { canOpen });
      return canOpen;
    }
    if (role === 'worker') {
      console.log('canOpenTicket: User is worker');
      return true;
    }
    console.log('canOpenTicket: No matching role condition');
    return false;
  };

  console.log('TicketList render:', {
    userProfileData,
    role,
    isLoadingProfile,
    isLoadingTickets,
    tickets: tickets?.length,
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Tickets</Typography>
        {isCustomer && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.TICKETS + '/new')}
          >
            New Ticket
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              {!isCustomer && <TableCell>Customer</TableCell>}
              <TableCell>Assignment</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets?.map((ticket) => {
              const isAssigned = Boolean(ticket.assignee_id);
              const isAssignedToCurrentUser = ticket.assignee_id === user?.id;
              const canOpen = canOpenTicket(ticket);

              return (
                <TableRow
                  key={ticket.id}
                  onClick={() => canOpen && navigate(ROUTES.TICKETS + '/' + ticket.id)}
                  sx={{
                    cursor: canOpen ? 'pointer' : 'default',
                    '&:hover': canOpen ? {
                      backgroundColor: '#f5f5f5',
                      '& td': { backgroundColor: '#f5f5f5' }
                    } : {},
                    backgroundColor: canOpen ? '#fafafa' : 'inherit',
                    transition: 'background-color 0.2s ease',
                    '& td': {
                      backgroundColor: canOpen ? '#fafafa' : 'inherit',
                      transition: 'background-color 0.2s ease'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isWorker && !isAssignedToCurrentUser && <LockIcon fontSize="small" color="action" />}
                      {ticket.title}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(isAdmin || (isWorker && isAssignedToCurrentUser)) ? (
                      <FormControl size="small">
                        <Select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuItem value={TicketStatus.PENDING}>Pending</MenuItem>
                          <MenuItem value={TicketStatus.IN_PROGRESS}>In Progress</MenuItem>
                          <MenuItem value={TicketStatus.RESOLVED}>Resolved</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={ticket.status}
                        color={statusColors[ticket.status as keyof typeof statusColors]}
                        size="small"
                      />
                    )}
                  </TableCell>
                  {!isCustomer && (
                    <TableCell>
                      {ticket.customer?.first_name} {ticket.customer?.last_name}
                    </TableCell>
                  )}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {isAdmin ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={ticket.assignee_id || ''}
                          onChange={(e) => handleAssigneeChange(ticket.id, e.target.value || null)}
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {workers?.map((worker) => (
                            <MenuItem key={worker.id} value={worker.id}>
                              {worker.first_name} {worker.last_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      isAssigned ? (
                        <Tooltip title={isAssignedToCurrentUser ? "Assigned to you" : `Assigned to ${ticket.assignee?.first_name} ${ticket.assignee?.last_name}`}>
                          <Chip 
                            label={isAssignedToCurrentUser ? "Assigned to you" : "Assigned"} 
                            color={isAssignedToCurrentUser ? "primary" : "default"} 
                            size="small" 
                          />
                        </Tooltip>
                      ) : (
                        <Chip label="Unassigned" color="default" size="small" />
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TicketList; 