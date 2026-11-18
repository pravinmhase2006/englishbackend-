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

  app.get('/api/health', async () => {
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

  // Public Privacy Policy for Google Play & App Store Compliance
  app.get('/privacy-policy', async (request, reply) => {
    reply.type('text/html');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - SpeakUp AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #f8fafc; }
    .card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    h1 { color: #2563eb; font-size: 28px; }
    h2 { color: #0f172a; margin-top: 24px; font-size: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Privacy Policy for SpeakUp</h1>
    <p><strong>Effective Date:</strong> January 1, 2026</p>
    <p>SpeakUp ("we", "our", or "us") is dedicated to protecting your privacy while helping you improve English fluency.</p>
    <h2>1. Information We Collect</h2>
    <p><strong>Audio & Voice Data:</strong> SpeakUp accesses your device microphone only during active speaking practice to analyze pronunciation and provide real-time AI fluency feedback. Audio is processed for feedback and is not sold to third parties.</p>
    <p><strong>Account Data:</strong> We store your name, email address, CEFR level, learning progress, and streaks to personalize your learning journey.</p>
    <h2>2. How We Use Information</h2>
    <p>We use your data solely to calculate speaking fluency scores, customize vocabulary and grammar modules, and maintain your learning streaks.</p>
    <h2>3. Data Security & Retention</h2>
    <p>We employ enterprise industry-standard encryption (HTTPS, JWT) to safeguard your personal information. You can delete your account and associated data at any time from within the application settings.</p>
    <h2>4. Contact Us</h2>
    <p>If you have any questions regarding this Privacy Policy, please contact our support team at <strong>support@speakup.ai</strong>.</p>
  </div>
</body>
</html>`;
  });

  // Public Terms of Service
  app.get('/terms', async (request, reply) => {
    reply.type('text/html');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - SpeakUp AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #f8fafc; }
    .card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    h1 { color: #2563eb; font-size: 28px; }
    h2 { color: #0f172a; margin-top: 24px; font-size: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Terms of Service</h1>
    <p><strong>Effective Date:</strong> January 1, 2026</p>
    <p>Welcome to SpeakUp. By accessing or using our mobile application and services, you agree to be bound by these Terms.</p>
    <h2>1. Use of the App</h2>
    <p>SpeakUp provides educational AI tools to practice and enhance spoken English. You agree to use the service in compliance with all applicable laws and respect community guidelines.</p>
    <h2>2. Intellectual Property</h2>
    <p>All content, curriculum, audio algorithms, and design assets are the intellectual property of SpeakUp and its licensors.</p>
    <h2>3. Disclaimer</h2>
    <p>SpeakUp provides AI-driven learning estimates. We do not guarantee specific official exam outcomes (such as IELTS or TOEFL).</p>
  </div>
</body>
</html>`;
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
