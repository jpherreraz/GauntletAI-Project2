import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@crm/shared/utils/tickets';
import type {
  Ticket,
  TicketCreate,
  TicketUpdate,
  TicketComment,
  TicketCommentCreate,
} from '@crm/shared/types/ticket';
import type {
  TicketListParams,
  FileUpload,
  TicketCountsResponse,
} from '@crm/shared/types/api';
import { supabase } from '@crm/shared/utils/api-client';

// Query keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: TicketListParams) => [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  comments: (ticketId: string) => [...ticketKeys.detail(ticketId), 'comments'] as const,
};

// Hooks
export const useTickets = (params: TicketListParams = {}) => {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketsApi.list(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.get(id),
    enabled: !!id,
  });
};

export const useTicketComments = (ticketId: string) => {
  return useQuery({
    queryKey: ticketKeys.comments(ticketId),
    queryFn: () => ticketsApi.comments.list(ticketId),
    enabled: !!ticketId,
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
    mutationFn: ({ id, ticket }: { id: string; ticket: TicketUpdate }) =>
      ticketsApi.update(id, ticket),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
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
    mutationFn: (comment: TicketCommentCreate) => ticketsApi.comments.create(comment),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.comments(ticketId) });
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