const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;


  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected to live instance: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Warning: Could not connect to MONGODB_URI (${err.message}). Falling back to in-memory MongoDB...`);
    }
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('[Database] Starting in-memory MongoDB instance for zero-config operation...');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] MongoDB Connected to in-memory instance: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] MongoDB disconnected cleanly');
  } catch (error) {
    console.error('[Database] Disconnect error:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
