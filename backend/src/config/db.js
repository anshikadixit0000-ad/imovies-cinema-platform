const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
    mongoose.set('strictQuery', false);
    
    // Attempt connection with short timeout so server boots instantly either way
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] Local MongoDB server not reachable (${error.message}).`);
    console.log(`[Database] Falling back to seamless High-Performance JSON/Memory Datastore for instant out-of-the-box operation!`);
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
