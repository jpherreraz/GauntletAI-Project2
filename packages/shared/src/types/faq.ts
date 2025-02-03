import { z } from 'zod';

export const faqSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type FAQ = z.infer<typeof faqSchema>;

export const faqCreateSchema = faqSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type FAQCreate = z.infer<typeof faqCreateSchema>;

export const faqUpdateSchema = faqCreateSchema.partial();

export type FAQUpdate = z.infer<typeof faqUpdateSchema>; 