import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/speakup_db',
  JWT_SECRET: process.env.JWT_SECRET || 'speakup_jwt_secret_super_key_2026_antigravity_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'speakup_refresh_token_super_secret_key_2026',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
};
