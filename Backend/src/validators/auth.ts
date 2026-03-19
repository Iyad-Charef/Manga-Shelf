import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  password: z.string().min(1, 'Password is required').max(100, 'Password is too long'),
});
