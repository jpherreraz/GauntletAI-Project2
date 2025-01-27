import { z } from 'zod';
import { userSchema } from './user';

export const TicketStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const ticketSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum([
    TicketStatus.PENDING,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  customer_id: z.string().uuid(),
  customer: userSchema.optional(),
  assignee_id: z.string().uuid().nullable(),
  assignee: userSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Ticket = z.infer<typeof ticketSchema>;

export const ticketUpdateSchema = ticketSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  customer_id: true,
  customer: true,
  assignee: true,
});

export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;

export const ticketCreateSchema = ticketSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    assignee_id: true,
    assignee: true,
    customer: true,
    status: true,
  })
  .extend({
    customer_id: z.string().uuid(),
  });

export type TicketCreate = z.infer<typeof ticketCreateSchema>;

export const ticketCommentSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  ticket_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  user: z.object({
    id: z.string(),
    role: z.string(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string()
  }).optional(),
});

export type TicketComment = z.infer<typeof ticketCommentSchema>;

export const ticketCommentCreateSchema = ticketCommentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type TicketCommentCreate = z.infer<typeof ticketCommentCreateSchema>; 