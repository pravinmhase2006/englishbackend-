import { FastifyInstance } from 'fastify';
import { VoiceController } from '../controllers/voice.controller';

export async function voiceRoutes(app: FastifyInstance) {
  app.post(
    '/transcribe',
    {
      schema: {
        tags: ['Voice Engine'],
        summary: 'Transcribe audio to text via Groq Whisper Large v3',
        description: 'Supports multipart audio upload or JSON audioBase64.',
      },
    },
    VoiceController.transcribe
  );

  app.post(
    '/speak',
    {
      schema: {
        tags: ['Voice Engine'],
        summary: 'Synthesize speech parameters for native TTS or cloud audio',
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', example: 'Welcome back! Ready for today\'s practice?' },
            voice: { type: 'string', example: 'Maya (US Native)' },
            rate: { type: 'number', example: 0.5 },
          },
        },
      },
    },
    VoiceController.speak
  );

  app.post(
    '/process',
    {
      schema: {
        tags: ['Voice Engine'],
        summary: 'End-to-End Voice Turn: Speech-to-Text -> Gemini AI -> Pronunciation Evaluation -> Speech Output',
        body: {
          type: 'object',
          properties: {
            userText: { type: 'string', example: 'I went to the library to study yesterday.' },
            audioBase64: { type: 'string' },
            topicTitle: { type: 'string', example: 'Daily Routines' },
            cefrLevel: { type: 'string', example: 'B1' },
          },
        },
      },
    },
    VoiceController.process
  );
}
