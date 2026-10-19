import mongoose from 'mongoose';
import fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './index.js';

let mongod = null;

export async function connectDB() {
  try {
    let mongoUri = config.database.uri;

    if (!mongoUri) {
      console.log('[Database] No MONGODB_URI provided in environment. Initializing local persistent MongoDB engine...');
      
      // Ensure data directory exists
      if (!fs.existsSync(config.database.dbPath)) {
        fs.mkdirSync(config.database.dbPath, { recursive: true });
      }

      // Initialize persistent embedded Mongo Server with dbPath
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: config.database.dbPath,
          storageEngine: 'wiredTiger'
        }
      });

      mongoUri = mongod.getUri() + 'kareem_bhai_surprise';
      console.log(`[Database] Local MongoDB engine started at: ${mongoUri}`);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);

    console.log('[Database] MongoDB connected successfully.');
  } catch (err) {
    console.error('[Database] Connection error:', err.message);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] Disconnected.');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
}
