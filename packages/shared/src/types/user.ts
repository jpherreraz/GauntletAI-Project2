import { z } from 'zod';

export const UserRole = {
  ADMIN: 'admin',
  WORKER: 'worker',
  CUSTOMER: 'customer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.WORKER, UserRole.CUSTOMER]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const userUpdateSchema = userSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userCreateSchema = userSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    role: true,
  })
  .extend({
    password: z.string().min(8),
  });

export type UserCreate = z.infer<typeof userCreateSchema>; 