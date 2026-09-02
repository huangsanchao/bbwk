import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// 登录接口限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 10, // 最多 10 次
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

export default router;
