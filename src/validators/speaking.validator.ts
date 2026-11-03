import { z } from 'zod';

export const createSpeakingSessionSchema = z.object({
  topicTitle: z.string().min(2),
  cefrLevel: z.string().optional().default('B1'),
});

export const addVoiceTurnSchema = z.object({
  userText: z.string().min(1, 'User spoken text is required'),
  audioDuration: z.string().optional(),
});
