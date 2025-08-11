import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long')
      .max(20, 'Username must be at most 20 characters long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform((val) => val.toLowerCase()), 

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(20, 'Password must be at most 20 characters long'),

    name: z.string()
    .min(3,'Name Must Be Longer Than 3 Characters')
    .max(30,'Name Must Be Less Than 30 Characters')
    .trim()
    .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform((val) => val.toLowerCase()),

    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});