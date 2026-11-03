import { z } from 'zod';

export const submitGrammarAnswerSchema = z.object({
  selectedOptionIndex: z.number().int().min(0),
});

export const submitChallengeAnswerSchema = z.object({
  selectedOption: z.number().int().min(0),
  secondsTaken: z.number().int().min(1).max(60),
});

export const updateWordProgressSchema = z.object({
  status: z.enum(['learning', 'mastered']),
});

export const logStudyHeartbeatSchema = z.object({
  minutes: z.number().int().min(1).max(120),
});
