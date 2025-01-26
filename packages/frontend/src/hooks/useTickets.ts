import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@crm/shared/utils/tickets';
import { supabase } from '@crm/shared/utils/api-client';
import {
  Ticket,
  TicketCreate,
  TicketUpdate,
  TicketComment,
  TicketCommentCreate,
  TicketStatus,
} from '@crm/shared/types/ticket';
import type {
  TicketListParams,
  FileUpload,
  TicketCountsResponse,
} from '@crm/shared/types/api';
import { User, UserRole } from '@crm/shared/types/user';

const TICKETS_QUERY_KEY = 'tickets';
const TICKET_COMMENTS_QUERY_KEY = 'ticket-comments';

// Query keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: TicketListParams) => [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  comments: (ticketId: string) => [...ticketKeys.detail(ticketId), 'comments'] as const,
};

interface UseTicketsOptions {
  customerId?: string;
  assigneeId?: string;
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_metadata: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface SupabaseTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  customer_id: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  customer: SupabaseUser;
  assignee: SupabaseUser | null;
}

export const useTickets = (options?: UseTicketsOptions) => {
  return useQuery<Ticket[]>({
    queryKey: ticketKeys.list({ customerId: options?.customerId, assigneeId: options?.assigneeId }),
    queryFn: async () => {
      const params: TicketListParams = {
        ...(options?.customerId && { customerId: options.customerId }),
        ...(options?.assigneeId && { assigneeId: options.assigneeId }),
      };
      const response = await ticketsApi.list(params);
      return response.tickets;
    },
  });
};

export const useTicket = (id: string) => {
  return useQuery<Ticket>({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.get(id),
  });
};

export const useTicketComments = (ticketId: string) => {
  return useQuery<TicketComment[]>({
    queryKey: [TICKET_COMMENTS_QUERY_KEY, ticketId],
    queryFn: async () => {
      const response = await ticketsApi.comments.list(ticketId);
      return response.comments;
    },
  });
};

export const useTicketCounts = () => {
  return useQuery({
    queryKey: ['ticketCounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_counts_view')
        .select('*')
        .single();

      if (error) throw error;
      return data as TicketCountsResponse;
    },
  });
};

// Mutations
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: TicketCreate) => ticketsApi.create(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string } & TicketUpdate) => {
      const { id, ...update } = params;
      return ticketsApi.update(id, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: TicketCommentCreate) => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: comment.ticket_id,
          user_id: comment.user_id,
          content: comment.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TICKET_COMMENTS_QUERY_KEY, variables.ticket_id],
      });
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: FileUpload) => ticketsApi.files.upload(params),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ticketId }: { id: string; ticketId: string }) =>
      ticketsApi.files.delete(id),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
  });
}; 