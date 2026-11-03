import { z } from 'zod';
import { CEFR_LEVELS } from '../constants/app_constants';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  preferences: z
    .object({
      nativeLanguage: z.string().optional(),
      tutorPersona: z.string().optional(),
      voiceSpeed: z.string().optional(),
      dailyReminders: z.boolean().optional(),
      acousticFeedback: z.boolean().optional(),
    })
    .optional(),
});

export const updateCefrSchema = z.object({
  cefrLevel: z.enum(CEFR_LEVELS),
});
