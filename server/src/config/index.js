import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/baby-wiki',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  logLevel: process.env.LOG_LEVEL || 'debug',
};
