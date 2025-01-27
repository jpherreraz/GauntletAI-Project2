import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  useTicket,
  useUpdateTicket,
  useTicketComments,
  useCreateComment,
  ticketKeys,
} from '../../hooks/useTickets';
import { useWorkers } from '../../hooks/useWorkers';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '@crm/shared/constants';
import type { TicketUpdate, TicketStatus as TicketStatusType, TicketComment } from '@crm/shared/types/ticket';
import { supabase } from '@crm/shared/utils/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@crm/shared/types/user';
import { useProfile } from '../../hooks/useProfile';

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
} as const;

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: ticket, isLoading: isLoadingTicket } = useTicket(id!);
  const { data: comments, isLoading: isLoadingComments } = useTicketComments(id!);
  const { data: workers } = useWorkers();
  const { data: userProfileData, isLoading: isLoadingProfile } = useProfile(user?.id);
  const updateTicket = useUpdateTicket();
  const createComment = useCreateComment();

  console.log('Comments data:', { comments, isLoadingComments });
  if (comments?.length > 0) {
    console.log('First comment structure:', JSON.stringify(comments[0], null, 2));
  }

  // Get the first item from the array since get_user_profile returns a single row
  const userProfile = userProfileData?.[0];
  const role = userProfile?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isWorker = role === 'worker';
  const isCustomer = role === 'customer';
  const isAssignedWorker = isWorker && ticket?.assignee_id === user?.id;

  // Subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    const commentsSubscription = supabase
      .channel(`ticket-comments-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${id}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ticketKeys.comments(id) });
        }
      )
      .subscribe();

    console.log('Subscribed to comments channel:', `ticket-comments-${id}`);

    return () => {
      console.log('Unsubscribing from comments channel');
      commentsSubscription.unsubscribe();
    };
  }, [id, queryClient]);

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    if (!ticket || (!isAdmin && !isAssignedWorker)) return;
    await updateTicket.mutateAsync({
      id: ticket.id,
      status: event.target.value as TicketStatusType,
    });
  };

  const handleAssigneeChange = (event: SelectChangeEvent<string>) => {
    if (!ticket || !user) return;
    updateTicket.mutate({
      id: ticket.id,
      assignee_id: event.target.value || null,
    });
  };

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim() || !ticket || !user) return;

    if (isWorker && !isAssignedWorker) {
      setError('Only assigned workers can comment on this ticket');
      return;
    }

    try {
      await createComment.mutateAsync({
        ticket_id: ticket.id,
        user_id: user.id,
        content: comment,
      });
      setComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  if (isLoadingTicket || isLoadingProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Ticket not found</Alert>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">User profile not found</Alert>
      </Box>
    );
  }

  // Check if user can access this ticket
  const canAccessTicket = isAdmin || 
    (isCustomer && ticket.customer_id === user?.id) || 
    (isWorker && (isAssignedWorker || !ticket.assignee_id));

  console.log('Access check:', {
    role,
    isAdmin,
    isCustomer,
    isWorker,
    isAssignedWorker,
    userId: user?.id,
    ticketCustomerId: ticket.customer_id,
    ticketAssigneeId: ticket.assignee_id,
    canAccessTicket,
    userProfile
  });

  if (!canAccessTicket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You don't have permission to view this ticket</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate(ROUTES.TICKETS)}
        >
          Back to Tickets
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.TICKETS)}
        >
          Back to Tickets
        </Button>
        <Typography variant="h4">Ticket #{ticket.id.slice(0, 8)}</Typography>
        <Chip
          label={ticket.status}
          color={statusColors[ticket.status as keyof typeof statusColors]}
        />
      </Box>

      <Box sx={{ display: 'flex', flex: 1, gap: 2, p: 2, overflow: 'hidden' }}>
        {/* Left panel - Ticket Details */}
        <Paper sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            {ticket.title}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {ticket.description}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            {/* Status Control */}
            {(isAdmin || isAssignedWorker) && (
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={ticket.status}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Assignment Control */}
            {isAdmin ? (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Assign to</InputLabel>
                <Select
                  value={ticket.assignee_id || ''}
                  label="Assign to"
                  onChange={handleAssigneeChange}
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
              ticket.assignee_id && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to
                  </Typography>
                  <Chip
                    label={
                      isAssignedWorker
                        ? "Assigned to you"
                        : `Assigned to ${ticket.assignee?.first_name} ${ticket.assignee?.last_name}`
                    }
                    color={isAssignedWorker ? "primary" : "default"}
                    size="small"
                  />
                </Box>
              )
            )}
          </Stack>
        </Paper>

        {/* Right panel - Chat */}
        <Paper sx={{ width: '40%', p: 3, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 120px)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Conversation
            </Typography>
          </Box>

          <Box 
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0 // This is important for flex overflow to work
            }}
          >
            {isLoadingComments ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : comments?.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: 'text.secondary', p: 3 }}>
                <Typography>No messages yet</Typography>
              </Box>
            ) : (
              comments?.map((comment: TicketComment) => {
                console.log('Rendering comment:', { comment });
                return (
                  <Box
                    key={comment.id}
                    sx={{
                      p: 2,
                      bgcolor: comment.user_id === user?.id ? 'primary.light' : 'grey.100',
                      borderRadius: 2,
                      maxWidth: '80%',
                      alignSelf: comment.user_id === user?.id ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {comment.user?.first_name} {comment.user?.last_name} •{' '}
                      {new Date(comment.created_at).toLocaleString()}
                    </Typography>
                    <Typography>{comment.content}</Typography>
                  </Box>
                );
              })
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {(ticket.customer_id === user?.id || isAssignedWorker || isAdmin) && (
            <form onSubmit={handleCommentSubmit}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your message..."
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!comment.trim()}
                fullWidth
              >
                Send Message
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Box>
  );
}; 