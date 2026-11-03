import { FastifyInstance } from 'fastify';
import { VocabularyController } from '../controllers/vocabulary.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function vocabularyRoutes(app: FastifyInstance) {
  app.get(
    '/word-of-the-day',
    {
      schema: {
        tags: ['Vocabulary'],
        summary: 'Get daily featured Word of the Day',
        description: 'Returns the active flashcard word (e.g. Confident) with phonetics, definition, example sentence, and memory anchor.',
      },
    },
    VocabularyController.getWordOfTheDay
  );

  app.get(
    '/',
    {
      schema: {
        tags: ['Vocabulary'],
        summary: 'Browse paginated vocabulary words',
        querystring: {
          type: 'object',
          properties: {
            cefrLevel: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], example: 'B1' },
            search: { type: 'string', example: 'con' },
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
          },
        },
      },
    },
    VocabularyController.getWords
  );

  app.post(
    '/:wordId/progress',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Vocabulary'],
        summary: 'Update mastery status for a vocabulary word',
        description: 'Marks word as "learning" (Still Learning) or "mastered" (I Got This!), awarding +15 XP upon mastery.',
        security: [{ BearerAuth: [] }],
        params: {
          type: 'object',
          required: ['wordId'],
          properties: {
            wordId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['learning', 'mastered'], example: 'mastered' },
          },
        },
      },
    },
    VocabularyController.updateProgress
  );

  app.get(
    '/my-deck',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Vocabulary'],
        summary: 'Get learner personalized flashcard deck',
        security: [{ BearerAuth: [] }],
      },
    },
    VocabularyController.getMyDeck
  );
}
