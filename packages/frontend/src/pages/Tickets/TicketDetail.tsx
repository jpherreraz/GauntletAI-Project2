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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
  const { data: comments } = useTicketComments(id!);
  const { data: workers } = useWorkers();
  const updateTicket = useUpdateTicket();
  const createComment = useCreateComment();

  const role = user?.user_metadata?.role;
  const isAdmin = role === UserRole.ADMIN;
  const isWorker = role === UserRole.WORKER;
  const isCustomer = role === UserRole.CUSTOMER;
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
        () => {
          queryClient.invalidateQueries({ queryKey: ticketKeys.comments(id) });
        }
      )
      .subscribe();

    return () => {
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

  if (isLoadingTicket) {
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

  // Check if user can access this ticket
  const canAccessTicket = isAdmin || isCustomer || (isWorker && isAssignedWorker);
  if (!canAccessTicket) {
    navigate(ROUTES.TICKETS);
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
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

            <Divider />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversation
            </Typography>
            <Box sx={{ mb: 3 }}>
              {comments?.map((comment: TicketComment) => (
                <Box
                  key={comment.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: comment.user_id === user?.id ? 'primary.light' : 'grey.100',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {comment.user_id === ticket.customer_id ? 'Customer' : 'Support Agent'} •{' '}
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                  <Typography>{comment.content}</Typography>
                </Box>
              ))}
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
                >
                  Send Message
                </Button>
              </form>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 