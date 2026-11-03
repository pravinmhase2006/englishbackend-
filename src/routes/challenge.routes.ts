import { FastifyInstance } from 'fastify';
import { ChallengeController } from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function challengeRoutes(app: FastifyInstance) {
  app.get(
    '/today',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Daily Challenges'],
        summary: 'Get today 60-second Daily Fluency Sprint',
        description: 'Returns today idiom challenge with 4 options and +50 XP reward status.',
        security: [{ BearerAuth: [] }],
      },
    },
    ChallengeController.getToday
  );

  app.post(
    '/today/submit',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Daily Challenges'],
        summary: 'Submit Daily Challenge speed quest answer',
        description: 'Validates answer against 60-second time window, increments streak, and awards +50 XP.',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          required: ['selectedOption', 'secondsTaken'],
          properties: {
            selectedOption: { type: 'integer', example: 0 },
            secondsTaken: { type: 'integer', example: 14 },
          },
        },
      },
    },
    ChallengeController.submit
  );
}
