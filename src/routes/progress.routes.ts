import { FastifyInstance } from 'fastify';
import { ProgressController } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function progressRoutes(app: FastifyInstance) {
  app.get(
    '/summary',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Progress & Stats'],
        summary: 'Get comprehensive learning progress & fluency metrics',
        description: 'Returns overall fluency benchmark (84%), monthly delta (+8%), and 4 skill meters (Pronunciation, Vocabulary, Grammar, Listening).',
        security: [{ BearerAuth: [] }],
      },
    },
    ProgressController.getSummary
  );

  app.get(
    '/streak-calendar',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Progress & Stats'],
        summary: 'Get 14-day streak calendar & weekly goal status',
        description: 'Returns 14-day study streak, 18/25 days goal indicator, and weekly activity flags.',
        security: [{ BearerAuth: [] }],
      },
    },
    ProgressController.getStreakCalendar
  );

  app.post(
    '/heartbeat',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Progress & Stats'],
        summary: 'Log active study minutes (Heartbeat tracker)',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          required: ['minutes'],
          properties: {
            minutes: { type: 'integer', example: 10 },
          },
        },
      },
    },
    ProgressController.heartbeat
  );
}
