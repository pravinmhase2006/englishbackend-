import mongoose from 'mongoose';
import { ENV } from './environment';
import { autoSeedDatabase } from './auto_seed';

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error event:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected to database.');
  });

  try {
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4,
    });
    console.log(`[MongoDB] Connected successfully to ${ENV.MONGODB_URI}`);
    await autoSeedDatabase();
  } catch (error) {
    console.error('[MongoDB] Initial connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[MongoDB] Disconnected.');
}
