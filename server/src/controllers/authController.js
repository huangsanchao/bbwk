import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User } from '../models/User.js';
import { config } from '../config/index.js';
import { successResponse, createdResponse, errorResponse } from '../utils/response.js';

/**
 * 生成 Access Token
 */
function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpire,
  });
}

/**
 * 生成 Refresh Token
 */
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpire,
  });
}

// 注册参数校验
const registerSchema = Joi.object({
  username: Joi.string().min(2).max(20).required().messages({
    'string.min': '用户名至少2个字符',
    'string.max': '用户名最多20个字符',
    'any.required': '用户名不能为空',
  }),
  email: Joi.string().email().required().messages({
    'string.email': '邮箱格式不正确',
    'any.required': '邮箱不能为空',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密码至少6个字符',
    'any.required': '密码不能为空',
  }),
  nickname: Joi.string().max(30).optional(),
  phone: Joi.string().optional(),
});

// 登录参数校验
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * 用户注册
 */
export async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return errorResponse(res, 400, '参数校验失败', error.details.map((d) => d.message));
    }

    const { username, email, password, nickname, phone } = value;

    // 检查用户名/邮箱是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return errorResponse(res, 400, '用户名或邮箱已被注册');
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      passwordHash: password,
      nickname: nickname || username,
      phone,
    });

    // 生成 Token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 保存 Refresh Token
    user.refreshToken = refreshToken;
    await user.save();

    return createdResponse(res, {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return errorResponse(res, 400, `${field} 已被注册`);
    }
    throw err;
  }
}

/**
 * 用户登录
 */
export async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return errorResponse(res, 400, '参数校验失败', error.details.map((d) => d.message));
    }

    const { email, password } = value;

    // 查找用户
    const user = await User.findOne({ email }).select('+passwordHash +status');
    if (!user) {
      return errorResponse(res, 401, '邮箱或密码错误');
    }

    // 检查状态
    if (user.status === 'banned') {
      return errorResponse(res, 403, '账号已被封禁');
    }

    // 比对密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, '邮箱或密码错误');
    }

    // 生成 Token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 保存 Refresh Token
    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(res, {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    throw err;
  }
}

/**
 * 刷新 Token
 */
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 400, '缺少 Refresh Token');
    }

    // 验证 Refresh Token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 401, 'Refresh Token 无效');
    }

    // 生成新的 Token 对
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Refresh Token 已过期，请重新登录');
    }
    throw error;
  }
}

/**
 * 退出登录
 */
export async function logout(req, res) {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }
    return successResponse(res, null, '已退出登录');
  } catch (err) {
    throw err;
  }
}
