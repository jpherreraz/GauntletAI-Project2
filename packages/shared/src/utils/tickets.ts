import { supabase } from './api-client';
import type {
  Ticket,
  TicketCreate,
  TicketUpdate,
  TicketComment,
  TicketCommentCreate,
} from '../types/ticket';
import type {
  TicketListParams,
  TicketListResponse,
  CommentListParams,
  CommentListResponse,
  FileUpload,
  FileUploadResponse,
} from '../types/api';
import { PAGINATION } from '../constants';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

// Helper to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Not authenticated');
  return session.access_token;
}

// Helper to make authenticated requests to edge functions
async function fetchApi(path: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const response = await fetch(`${EDGE_FUNCTION_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw error;
  }

  return response.json();
}

// Ticket operations
export const ticketsApi = {
  // List tickets with filtering and pagination
  list: async (params: TicketListParams = {}): Promise<TicketListResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('perPage', params.perPage.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.assigneeId) searchParams.set('assigneeId', params.assigneeId);
    if (params.customerId) searchParams.set('customerId', params.customerId);
    if (params.search) searchParams.set('search', params.search);

    const { tickets } = await fetchApi('/tickets?' + searchParams.toString());
    return {
      tickets,
      total: tickets.length, // TODO: implement proper pagination in edge function
      page: params.page || PAGINATION.DEFAULT_PAGE,
      perPage: params.perPage || PAGINATION.DEFAULT_PER_PAGE,
    };
  },

  // Get a single ticket by ID
  get: async (id: string): Promise<Ticket> => {
    const { ticket } = await fetchApi(`/tickets/${id}`);
    return ticket;
  },

  // Create a new ticket
  create: async (ticket: TicketCreate): Promise<Ticket> => {
    const { ticket: createdTicket } = await fetchApi('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
    return createdTicket;
  },

  // Update a ticket
  update: async (id: string, ticket: TicketUpdate): Promise<Ticket> => {
    const { ticket: updatedTicket } = await fetchApi(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigneeId: ticket.assignee_id,
      }),
    });
    return updatedTicket;
  },

  // Delete a ticket
  delete: async (id: string): Promise<void> => {
    await fetchApi(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  // Comments operations
  comments: {
    // List comments for a ticket
    list: async (
      ticketId: string,
      params: CommentListParams = {}
    ): Promise<CommentListResponse> => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.perPage) searchParams.set('perPage', params.perPage.toString());

      const { comments } = await fetchApi(`/tickets/${ticketId}/comments?` + searchParams.toString());
      return {
        comments,
        total: comments.length, // TODO: implement proper pagination in edge function
        page: params.page || PAGINATION.DEFAULT_PAGE,
        perPage: params.perPage || PAGINATION.DEFAULT_PER_PAGE,
      };
    },

    // Create a comment
    create: async (comment: TicketCommentCreate): Promise<TicketComment> => {
      const { comment: createdComment } = await fetchApi(`/tickets/${comment.ticket_id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: comment.content }),
      });
      return createdComment;
    },
  },

  // File operations
  files: {
    // Upload a file
    upload: async ({ file, ticketId }: FileUpload): Promise<FileUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const { attachment } = await fetchApi(`/tickets/${ticketId}/attachments`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type with boundary
      });
      return attachment;
    },

    // Delete a file
    delete: async (id: string): Promise<void> => {
      await fetchApi(`/tickets/attachments/${id}`, {
        method: 'DELETE',
      });
    },
  },
}; 