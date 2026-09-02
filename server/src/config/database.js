import mongoose from 'mongoose';
import { config } from '../config/index.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
