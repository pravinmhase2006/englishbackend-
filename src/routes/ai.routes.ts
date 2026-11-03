import { FastifyInstance } from 'fastify';
import { AiController } from '../controllers/ai.controller';

export async function aiRoutes(app: FastifyInstance) {
  app.post(
    '/chat',
    {
      schema: {
        tags: ['AI Engine'],
        summary: 'Send a message to Maya AI Tutor (Gemini 1.5 Flash)',
        description: 'Returns contextual dialogue continuation, constructive grammar/pronunciation feedback, and fluency score.',
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', example: 'I would like to order a cappuccino, please.' },
            topicTitle: { type: 'string', example: 'Ordering at a Cafe' },
            cefrLevel: { type: 'string', example: 'B1' },
          },
        },
      },
    },
    AiController.chat
  );

  app.post(
    '/generate',
    {
      schema: {
        tags: ['AI Engine'],
        summary: 'Generate learning content with Gemini',
        body: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: { type: 'string', example: 'Explain the difference between present perfect and past simple.' },
          },
        },
      },
    },
    AiController.generate
  );

  app.post(
    '/stream',
    {
      schema: {
        tags: ['AI Engine'],
        summary: 'Stream AI conversational chunks using SSE (Server-Sent Events)',
      },
    },
    AiController.stream
  );
}
