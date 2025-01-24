import { z } from 'zod';
import type { Ticket, TicketComment } from './ticket';

// Ticket API types
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface TicketListParams extends PaginationParams {
  status?: string;
  priority?: string;
  customerId?: string;
  assigneeId?: string | null;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  deleted?: boolean;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  perPage: number;
}

export interface CommentListParams extends PaginationParams {}

export interface CommentListResponse {
  comments: TicketComment[];
  total: number;
  page: number;
  perPage: number;
}

// File upload types
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  ticketId: z.string().uuid(),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

export const fileUploadResponseSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileUrl: z.string(),
  uploadedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;

export const ticketCountsResponseSchema = z.object({
  unassigned: z.number(),
  unsolved: z.number(),
  recent: z.number(),
  pending: z.number(),
  solved: z.number(),
  suspended: z.number(),
  deleted: z.number(),
});

export type TicketCountsResponse = z.infer<typeof ticketCountsResponseSchema>; 