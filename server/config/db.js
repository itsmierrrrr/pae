import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pae';

  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${db.connection.name}`);
    return true;
  } catch (error) {
    console.warn('MongoDB unavailable, running with in-memory fallback:', error.message);
    return false;
  }
};
