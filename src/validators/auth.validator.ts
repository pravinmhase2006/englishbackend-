import { z } from 'zod';
import { CEFR_LEVELS } from '../constants/app_constants';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  cefrLevel: z.enum(CEFR_LEVELS).optional().default('B1'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'apple']),
  token: z.string().min(1, 'Provider token or id is required'),
  name: z.string().optional(),
  email: z.string().email().optional(),
});
