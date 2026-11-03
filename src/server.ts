import { buildApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { ENV } from './config/environment';

async function startServer() {
  await connectDatabase();

  const app = buildApp();

  try {
    const address = await app.listen({ port: ENV.PORT, host: ENV.HOST });
    console.log(`[SpeakUp Server] Running at: ${address}`);
    console.log(`[SpeakUp Server] API prefix: ${address}/api/v1`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\n[SpeakUp Server] Received ${signal}, closing gracefully...`);
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    });
  }
}

startServer();
