import { z } from 'zod';
import { ticketSchema, ticketCommentSchema } from './ticket';

// Ticket API types
export const ticketListParamsSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type TicketListParams = z.infer<typeof ticketListParamsSchema>;

export const ticketListResponseSchema = z.object({
  tickets: z.array(ticketSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export type TicketListResponse = z.infer<typeof ticketListResponseSchema>;

// Comment API types
export const commentListParamsSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
});

export type CommentListParams = z.infer<typeof commentListParamsSchema>;

export const commentListResponseSchema = z.object({
  comments: z.array(ticketCommentSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export type CommentListResponse = z.infer<typeof commentListResponseSchema>;

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