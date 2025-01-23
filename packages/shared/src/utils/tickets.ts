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

// Ticket operations
export const ticketsApi = {
  // List tickets with filtering and pagination
  list: async (params: TicketListParams = {}): Promise<TicketListResponse> => {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      perPage = PAGINATION.DEFAULT_PER_PAGE,
      status,
      priority,
      assigneeId,
      customerId,
      search,
    } = params;

    let query = supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .range((page - 1) * perPage, page * perPage - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (assigneeId) query = query.eq('assignee_id', assigneeId);
    if (customerId) query = query.eq('customer_id', customerId);
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: tickets, count, error } = await query;

    if (error) throw error;

    return {
      tickets: tickets as Ticket[],
      total: count || 0,
      page,
      perPage,
    };
  },

  // Get a single ticket by ID
  get: async (id: string): Promise<Ticket> => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Ticket;
  },

  // Create a new ticket
  create: async (ticket: TicketCreate): Promise<Ticket> => {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data as Ticket;
  },

  // Update a ticket
  update: async (id: string, ticket: TicketUpdate): Promise<Ticket> => {
    const { data, error } = await supabase
      .from('tickets')
      .update(ticket)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ticket;
  },

  // Delete a ticket
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw error;
  },

  // Comments operations
  comments: {
    // List comments for a ticket
    list: async (
      ticketId: string,
      params: CommentListParams = {}
    ): Promise<CommentListResponse> => {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        perPage = PAGINATION.DEFAULT_PER_PAGE,
      } = params;

      const { data: comments, count, error } = await supabase
        .from('ticket_comments')
        .select('*', { count: 'exact' })
        .eq('ticket_id', ticketId)
        .range((page - 1) * perPage, page * perPage - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        comments: comments as TicketComment[],
        total: count || 0,
        page,
        perPage,
      };
    },

    // Create a comment
    create: async (comment: TicketCommentCreate): Promise<TicketComment> => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      return data as TicketComment;
    },
  },

  // File operations
  files: {
    // Upload a file
    upload: async ({
      file,
      ticketId,
    }: FileUpload): Promise<FileUploadResponse> => {
      const fileName = `${ticketId}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(fileName);

      // Create attachment record
      const { data: attachment, error: attachmentError } = await supabase
        .from('ticket_attachments')
        .insert({
          ticket_id: ticketId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (attachmentError) throw attachmentError;

      return attachment as FileUploadResponse;
    },

    // Delete a file
    delete: async (id: string): Promise<void> => {
      const { data: attachment, error: fetchError } = await supabase
        .from('ticket_attachments')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const filePath = attachment.file_url.split('/').slice(-2).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ticket-attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record
      const { error: deleteError } = await supabase
        .from('ticket_attachments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    },
  },
}; 