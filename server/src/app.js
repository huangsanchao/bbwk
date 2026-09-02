import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { loadKnowledgeIndex } from './services/knowledge.js';

const app = express();

// 安全中间件
app.use(helmet());

// CORS
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:5173'],
  credentials: true,
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// 全局限流
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('X-RateLimit-Limit', '100');
  }
  next();
});

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes);

// 404 & 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务
async function start() {
  await connectDatabase();

  // 加载知识库索引
  try {
    await loadKnowledgeIndex();
  } catch (err) {
    console.warn('️  知识库索引加载失败:', err.message);
  }

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start();

export default app;
