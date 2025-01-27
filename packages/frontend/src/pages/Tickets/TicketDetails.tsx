import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useTicket, useTicketComments, useCreateComment } from '../../hooks/useTickets';
import { ROUTES } from '@crm/shared/constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@crm/shared/types/user';
import { TicketComment } from '@crm/shared/types/ticket';

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
} as const;

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const { data: ticket, isLoading: ticketLoading } = useTicket(id!);
  const { data: comments, isLoading: commentsLoading } = useTicketComments(id!);
  const createComment = useCreateComment();

  const isCustomer = user?.user_metadata?.role === UserRole.CUSTOMER;
  const isWorker = user?.user_metadata?.role === UserRole.WORKER;
  const isAdmin = user?.user_metadata?.role === UserRole.ADMIN;

  const canViewTicket = () => {
    if (!ticket || !user) return false;
    if (isAdmin) return true;
    if (isCustomer) return ticket.customer_id === user.id;
    if (isWorker) return ticket.assignee_id === user.id;
    return false;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id || !user) return;

    try {
      await createComment.mutateAsync({
        ticket_id: id,
        user_id: user.id,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  if (ticketLoading || commentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket || !canViewTicket()) {
    navigate(ROUTES.TICKETS);
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => navigate(ROUTES.TICKETS)}>Back to Tickets</Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">{ticket.title}</Typography>
          <Chip
            label={ticket.status}
            color={statusColors[ticket.status as keyof typeof statusColors]}
          />
        </Box>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Created by: {ticket.customer?.first_name} {ticket.customer?.last_name}
        </Typography>

        {ticket.assignee && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Assigned to: {ticket.assignee.first_name} {ticket.assignee.last_name}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography>{ticket.description}</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Conversation
        </Typography>

        <Box sx={{ mb: 3, maxHeight: 400, overflowY: 'auto' }}>
          {(comments as TicketComment[])?.map((comment: TicketComment) => (
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

        <form onSubmit={handleSubmitComment}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Type your message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newComment.trim() || createComment.isPending}
              sx={{ minWidth: 100 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default TicketDetails; 