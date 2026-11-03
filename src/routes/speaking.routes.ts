import { FastifyInstance } from 'fastify';
import { SpeakingController } from '../controllers/speaking.controller';
import { authenticate } from '../middleware/auth.middleware';

export async function speakingRoutes(app: FastifyInstance) {
  app.get(
    '/topics',
    {
      schema: {
        tags: ['Speaking Practice'],
        summary: 'List available conversational practice scenarios',
        description: 'Returns preset scenarios (Cafe order, job interview, hobbies) with starter prompts & suggested phrases.',
      },
    },
    SpeakingController.getTopics
  );

  app.post(
    '/sessions',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Speaking Practice'],
        summary: 'Start an AI voice practice session',
        security: [{ BearerAuth: [] }],
        body: {
          type: 'object',
          required: ['topicTitle'],
          properties: {
            topicTitle: { type: 'string', example: 'Ordering at a Cafe' },
            cefrLevel: { type: 'string', example: 'B1' },
          },
        },
      },
    },
    SpeakingController.createSession
  );

  app.post(
    '/sessions/:sessionId/voice-turn',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Speaking Practice'],
        summary: 'Submit spoken voice turn for pronunciation evaluation',
        description: 'Evaluates word precision (0-100%), overall fluency, generates acoustic coach tip, and produces AI tutor response.',
        security: [{ BearerAuth: [] }],
        params: {
          type: 'object',
          required: ['sessionId'],
          properties: {
            sessionId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['userText'],
          properties: {
            userText: { type: 'string', example: "I'd like an iced latte with oat milk, please." },
            audioDuration: { type: 'string', example: '0:04' },
          },
        },
      },
    },
    SpeakingController.submitVoiceTurn
  );

  app.get(
    '/sessions/:sessionId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Speaking Practice'],
        summary: 'Get session conversation history & score breakdown',
        security: [{ BearerAuth: [] }],
        params: {
          type: 'object',
          required: ['sessionId'],
          properties: {
            sessionId: { type: 'string' },
          },
        },
      },
    },
    SpeakingController.getSession
  );
}
