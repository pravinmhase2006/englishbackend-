import { FastifyInstance } from 'fastify';
import { GrammarController } from '../controllers/grammar.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function grammarRoutes(app: FastifyInstance) {
  app.get(
    '/units',
    {
      schema: {
        tags: ['Grammar'],
        summary: 'List grammar curriculum units',
        description: 'Returns structured units (e.g. Unit 4: Mastering Sentence Flow).',
      },
    },
    GrammarController.getUnits
  );

  app.get(
    '/units/:unitId/questions',
    {
      schema: {
        tags: ['Grammar'],
        summary: 'Get drill questions for a specific grammar unit',
        params: {
          type: 'object',
          required: ['unitId'],
          properties: {
            unitId: { type: 'string' },
          },
        },
      },
    },
    GrammarController.getUnitQuestions
  );

  app.post(
    '/questions/:questionId/verify',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Grammar'],
        summary: 'Verify grammar multiple-choice answer',
        description: 'Validates chosen connector option, provides grammar rule explanation, and awards +20 XP on correct answer.',
        security: [{ BearerAuth: [] }],
        params: {
          type: 'object',
          required: ['questionId'],
          properties: {
            questionId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['selectedOptionIndex'],
          properties: {
            selectedOptionIndex: { type: 'integer', example: 0 },
          },
        },
      },
    },
    GrammarController.verifyAnswer
  );
}
