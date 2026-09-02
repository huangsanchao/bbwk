import { config } from '../config/index.js';
import { errorResponse } from '../utils/response.js';

/**
 * 全局错误处理中间件
 */
export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.url}`, err);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 400, '参数校验失败', messages);
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 400, `${field} 已存在`);
  }

  // Mongoose CastError (无效 ID)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, '无效的资源 ID');
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, '无效的令牌');
  }

  // 开发环境返回详细信息
  if (config.nodeEnv === 'development') {
    return res.status(500).json({
      code: 500,
      message: err.message,
      stack: err.stack,
    });
  }

  return errorResponse(res, 500, '服务器内部错误');
}

/**
 * 404 处理
 */
export function notFoundHandler(req, res) {
  return errorResponse(res, 404, '接口不存在');
}
