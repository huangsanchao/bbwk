// 聊天 API — SSE 流式响应
import { Router } from 'express';
import { ragQuery } from '../services/rag.js';

const router = Router();

/**
 * POST /api/v1/chat
 * 用户提问 → RAG 检索 → LLM 流式返回
 *
 * 请求体: { question: string, history?: Array<{role, content}> }
 * 响应: text/event-stream (SSE)
 */
router.post('/', async (req, res) => {
  const { question, history = [] } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: '请提供问题内容' });
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = await ragQuery(question.trim(), { history });

    stream.on('data', (chunk) => {
      res.write(chunk);
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ type: 'error', message: '服务暂时不可用，请稍后重试' })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: '服务暂时不可用，请稍后重试' })}\n\n`);
    res.end();
  }
});

export default router;
