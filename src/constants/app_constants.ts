export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = typeof CEFR_LEVELS[number];

export const USER_ROLES = ['learner', 'pro_learner', 'admin'] as const;
export type UserRole = typeof USER_ROLES[number];

export const TUTOR_PERSONAS = ['Maya (US Native)', 'Oliver (UK Native)', 'Sophia (AU Native)'] as const;
export type TutorPersona = typeof TUTOR_PERSONAS[number];

export const XP_REWARDS = {
  VOCABULARY_MASTERED: 15,
  GRAMMAR_QUESTION_CORRECT: 20,
  DAILY_CHALLENGE_COMPLETED: 50,
  SPEAKING_SESSION_COMPLETED: 25,
};
