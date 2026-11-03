import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/environment';
import { swaggerOptions, swaggerUiOptions } from './config/swagger';
import { apiRoutes } from './routes';
import { sendError } from './utils/response.utils';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        strict: false,
      },
    },
  });

  // Ensure upload directory exists
  const uploadPath = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Register Security Headers (Helmet)
  app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // Register Rate Limiting
  app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
  });

  // Register CORS
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Register JWT
  app.register(jwt, {
    secret: ENV.JWT_SECRET,
  });

  // Register Multipart for file uploads
  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Register Static files
  app.register(fastifyStatic, {
    root: uploadPath,
    prefix: '/uploads/',
  });

  // Register OpenAPI / Swagger Specification
  app.register(fastifySwagger, swaggerOptions);

  // Register Interactive Swagger UI Documentation at /docs
  app.register(fastifySwaggerUi, swaggerUiOptions);

  // Health check route
  app.get('/health', async () => {
    const isDbConnected = mongoose.connection.readyState === 1;
    return {
      status: isDbConnected ? 'healthy' : 'degraded',
      service: 'SpeakUp AI Backend',
      database: isDbConnected ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      documentation: '/docs',
    };
  });

  // Register API v1 routes
  app.register(apiRoutes, { prefix: '/api/v1' });

  // Global Error Handler
  app.setErrorHandler((error: any, request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    return sendError(reply, message, statusCode);
  });

  return app;
}
