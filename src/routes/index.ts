import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { speakingRoutes } from './speaking.routes';
import { vocabularyRoutes } from './vocabulary.routes';
import { grammarRoutes } from './grammar.routes';
import { challengeRoutes } from './challenge.routes';
import { progressRoutes } from './progress.routes';
import { adminRoutes } from './admin.routes';

export async function apiRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(speakingRoutes, { prefix: '/speaking' });
  app.register(vocabularyRoutes, { prefix: '/vocabulary' });
  app.register(grammarRoutes, { prefix: '/grammar' });
  app.register(challengeRoutes, { prefix: '/daily-challenges' });
  app.register(progressRoutes, { prefix: '/progress' });
  app.register(adminRoutes, { prefix: '/admin' });
}
