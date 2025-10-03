import { z } from 'zod';
import { MESSAGES } from '../constants/constants';

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, MESSAGES.VALIDATION.USERNAME_MIN_LENGTH)
      .max(20, MESSAGES.VALIDATION.USERNAME_MAX_LENGTH)
      .regex(/^[a-zA-Z0-9_]+$/, MESSAGES.VALIDATION.USERNAME_REGEX),
    
    email: z
      .string()
      .trim()
      .email(MESSAGES.VALIDATION.INVALID_EMAIL)
      .transform((val) => val.toLowerCase()), 

    password: z
      .string()
      .min(6, MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH)
      .max(20, MESSAGES.VALIDATION.PASSWORD_MAX_LENGTH),

    name: z.string()
    .min(3,MESSAGES.VALIDATION.NAME_MIN_LENGTH)
    .max(30,MESSAGES.VALIDATION.NAME_MAX_LENGTH)
    .trim()
    .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email(MESSAGES.VALIDATION.INVALID_EMAIL)
      .transform((val) => val.toLowerCase()),

    password: z
      .string()
      .min(1, MESSAGES.VALIDATION.PASSWORD_REQUIRED),
  }),
});