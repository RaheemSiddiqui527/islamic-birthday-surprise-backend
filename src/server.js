import http from 'http';
import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { seedDefaults } from './utils/seedDefaults.js';
import { config } from './config/index.js';

async function startServer() {
  try {
    console.log('[Server] Connecting to database...');
    await connectDB();

    console.log('[Server] Checking and running defaults seeder...');
    await seedDefaults();

    const server = http.createServer(app);

    server.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🕌 Islamic Birthday Surprise API Server Running!`);
      console.log(`📍 Port: ${config.port}`);
      console.log(`🌐 API Base: http://localhost:${config.port}/api/v1`);
      console.log(`🔒 Admin Login: http://localhost:${config.clientUrl ? '5173/admin/login' : config.port + '/admin/login'}`);
      console.log(`❤️  Greeting: JANAMDIN MUBARAK, BHAI JAAN ❤️`);
      console.log(`====================================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Shutdown complete.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
