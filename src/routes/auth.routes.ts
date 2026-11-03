import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new learner account',
        description: 'Creates a new user profile with hashed password and initial CEFR placement.',
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Alex Carter' },
            email: { type: 'string', format: 'email', example: 'alex.carter@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            cefrLevel: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'B1' },
          },
        },
        response: {
          201: {
            description: 'User registered successfully with JWT tokens',
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object', additionalProperties: true },
                  tokens: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    AuthController.register
  );

  app.post(
    '/login',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Log in with email & password',
        description: 'Authenticates credentials and returns a 7-day JWT access token and 30-day refresh token.',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alex.carter@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        response: {
          200: {
            description: 'Authentication successful',
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object', additionalProperties: true },
                  tokens: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    AuthController.login
  );

  app.post(
    '/social',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Single Sign-On with Google or Apple',
        description: 'Authenticates or auto-creates learner profile via Google or Apple OAuth tokens.',
        body: {
          type: 'object',
          required: ['provider', 'token'],
          properties: {
            provider: { type: 'string', enum: ['google', 'apple'], example: 'google' },
            token: { type: 'string', example: 'oauth_token_xyz' },
            name: { type: 'string', example: 'Alex Carter' },
            email: { type: 'string', format: 'email', example: 'alex.carter@example.com' },
          },
        },
      },
    },
    AuthController.socialLogin
  );
}
