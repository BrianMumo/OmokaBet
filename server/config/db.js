const mongoose = require('mongoose');

const connectDB = async () => {
  // First, try the configured MongoDB URI
  const configuredUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/omokabet';

  try {
    const conn = await mongoose.connect(configuredUri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`⚠️  MongoDB not available at ${configuredUri}, starting in-memory database...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-memory MongoDB started: ${uri}`);
      console.log('   ⚠️  Data will NOT persist between restarts!');

      return conn;
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
      console.error('   Install mongodb-memory-server: npm install mongodb-memory-server');
      console.error('   Or install MongoDB locally: https://www.mongodb.com/try/download/community');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
