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
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.WORKER, UserRole.CUSTOMER]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  avatar: z.string().url().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const userUpdateSchema = userSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userCreateSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
  })
  .extend({
    password: z.string().min(8),
  });

export type UserCreate = z.infer<typeof userCreateSchema>; 