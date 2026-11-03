import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'SpeakUp AI — Backend API Documentation',
      description: `
## SpeakUp AI Voice & Fluency Learning Engine
Production REST API supporting the SpeakUp mobile application.

### Key Capabilities:
* **JWT Authentication:** Access & Refresh token rotation with bcrypt password hashing.
* **CEFR Progression:** Step 1/4 onboarding & level mapping (Beginner A1-A2, Intermediate B1-B2, Advanced C1-C2).
* **AI Voice Simulation:** Turn-by-turn speech assessment, word accuracy scoring (0–100%), and acoustic intonation tips.
* **Vocabulary Flashcards:** Word of the Day, phonetic pronunciation anchors, and mastery tracking.
* **Grammar Drills:** Unit 4 Sentence flow connector challenges with immediate explanation feedback.
* **Daily Fluency Sprint:** 60-second speed idiom quest with +50 XP and streak multipliers.
* **Progress Analytics:** 84% benchmark score, 4-skill breakdown, and 14-day habit streak tracking.

---
### Authentication Guide:
Click the **Authorize** button on the top right, enter your token in the format:
\`Bearer <your_jwt_access_token>\`
      `,
      version: '1.0.0',
      contact: {
        name: 'SpeakUp Engineering Team',
        email: 'api-support@speakup.ai',
      },
    },
    servers: [
      {
        url: 'http://127.0.0.1:5000',
        description: 'Local Development Server (Web / Desktop / iOS Simulator)',
      },
      {
        url: 'http://10.0.2.2:5000',
        description: 'Android Emulator Host Gateway',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your JWT access token obtained from /api/v1/auth/login or /api/v1/auth/register',
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User registration, login, and social SSO flows' },
      { name: 'Users & Profile', description: 'Account settings, CEFR level selection, and preferences' },
      { name: 'Speaking Practice', description: 'Interactive AI voice sessions, pronunciation scoring, and dialogue' },
      { name: 'Vocabulary', description: 'Word of the Day, CEFR word lists, and mastery tracking' },
      { name: 'Grammar', description: 'Curriculum units, connector quizzes, and rule explanations' },
      { name: 'Daily Challenges', description: 'Time-limited idiom sprints and XP combo rewards' },
      { name: 'Progress & Stats', description: 'Fluency benchmarks, 4-skill breakdown, and streak calendar' },
    ],
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  initOAuth: {},
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
};
