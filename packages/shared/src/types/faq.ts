import { z } from 'zod';

export const faqSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FAQ = z.infer<typeof faqSchema>;

export const faqCreateSchema = faqSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FAQCreate = z.infer<typeof faqCreateSchema>;

export const faqUpdateSchema = faqCreateSchema.partial();

export type FAQUpdate = z.infer<typeof faqUpdateSchema>; 