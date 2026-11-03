import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users & Profile'],
        summary: 'Get current learner profile & study stats',
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            description: 'Learner profile retrieved',
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    UserController.getMe
  );

  app.patch(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users & Profile'],
        summary: 'Update learner profile & preferences',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Alex Carter' },
            preferences: {
              type: 'object',
              properties: {
                nativeLanguage: { type: 'string', example: 'Spanish (Español)' },
                tutorPersona: { type: 'string', example: 'Maya (US Native)' },
                voiceSpeed: { type: 'string', example: '1.0x (Normal)' },
                dailyReminders: { type: 'boolean', example: true },
                acousticFeedback: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
    UserController.updateMe
  );

  app.patch(
    '/me/cefr',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users & Profile'],
        summary: 'Update CEFR proficiency level (Step 1/4 flow)',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          required: ['cefrLevel'],
          properties: {
            cefrLevel: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], example: 'B2' },
          },
        },
      },
    },
    UserController.updateCefrLevel
  );

  app.post(
    '/me/avatar',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users & Profile'],
        summary: 'Upload profile avatar image',
        security: [{ BearerAuth: [] }],
      },
    },
    UserController.uploadAvatar
  );
}
