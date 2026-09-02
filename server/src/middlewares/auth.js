import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/response.js';

/**
 * JWT 认证中间件 - 验证 Access Token
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, '未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.userId).select('+status');
    if (!user) {
      return errorResponse(res, 401, '用户不存在');
    }

    if (user.status === 'banned') {
      return errorResponse(res, 403, '账号已被封禁');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, '令牌已过期');
    }
    return errorResponse(res, 401, '无效的认证令牌');
  }
}

/**
 * 角色权限中间件
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, '请先登录');
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, '权限不足');
    }
    next();
  };
}

/**
 * 可选认证 - 有 token 则解析用户，无 token 则跳过
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
}
