import { z } from 'zod';

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const ticketAttachmentSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileUrl: z.string().url(),
  uploadedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type TicketAttachment = z.infer<typeof ticketAttachmentSchema>;

export const ticketSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum([
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.PENDING,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ]),
  priority: z.enum([
    TicketPriority.LOW,
    TicketPriority.MEDIUM,
    TicketPriority.HIGH,
    TicketPriority.URGENT,
  ]),
  customerId: z.string().uuid(),
  assigneeId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  dueDate: z.string().datetime().nullable(),
  tags: z.array(z.string()),
  category: z.string(),
  attachments: z.array(ticketAttachmentSchema).optional(),
});

export type Ticket = z.infer<typeof ticketSchema>;

export const ticketUpdateSchema = ticketSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  customerId: true,
});

export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;

export const ticketCreateSchema = ticketSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    assigneeId: true,
  })
  .extend({
    customerId: z.string().uuid(),
    dueDate: z.string().datetime().nullable(),
  });

export type TicketCreate = z.infer<typeof ticketCreateSchema>;

export const ticketCommentSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  attachments: z.array(z.string().url()),
});

export type TicketComment = z.infer<typeof ticketCommentSchema>;

export const ticketCommentCreateSchema = ticketCommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TicketCommentCreate = z.infer<typeof ticketCommentCreateSchema>; 