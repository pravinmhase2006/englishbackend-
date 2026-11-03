import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { speakingRoutes } from './speaking.routes';
import { vocabularyRoutes } from './vocabulary.routes';
import { grammarRoutes } from './grammar.routes';
import { challengeRoutes } from './challenge.routes';
import { progressRoutes } from './progress.routes';
import { adminRoutes } from './admin.routes';
import { aiRoutes } from './ai.routes';
import { voiceRoutes } from './voice.routes';
import mongoose from 'mongoose';

export async function apiRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(speakingRoutes, { prefix: '/speaking' });
  app.register(vocabularyRoutes, { prefix: '/vocabulary' });
  app.register(grammarRoutes, { prefix: '/grammar' });
  app.register(challengeRoutes, { prefix: '/daily-challenges' });
  app.register(progressRoutes, { prefix: '/progress' });
  app.register(adminRoutes, { prefix: '/admin' });
  app.register(aiRoutes, { prefix: '/ai' });
  app.register(voiceRoutes, { prefix: '/voice' });

  // /api/v1/health check
  app.get('/health', async () => {
    const isDbConnected = mongoose.connection.readyState === 1;
    return {
      status: isDbConnected ? 'healthy' : 'degraded',
      service: 'SpeakUp AI API',
      database: isDbConnected ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  });
}
