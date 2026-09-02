// 聊天 API — SSE 流式请求
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

/**
 * 流式聊天请求
 * @param {string} question - 用户问题
 * @param {Array} history - 对话历史 [{role, content}]
 * @param {Function} onChunk - 每次收到内容块时的回调 (text)
 * @param {Function} onDone - 完成回调 (citations)
 * @param {Function} onError - 错误回调 (message)
 */
export function streamChat(question, history = [], onChunk, onDone, onError) {
  const abortController = new AbortController();

  // 用 fetch 做 SSE（axios 对 SSE 支持不好）
  fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
    signal: abortController.signal,
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.body;
    })
    .then(stream => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let citations = [];

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            onDone?.(citations);
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // 保留未完成的行

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                onDone?.(citations);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content') {
                  // 降级消息（无相关内容时）
                  onChunk?.(parsed.text);
                } else if (parsed.type === 'citations') {
                  citations = parsed.citations || [];
                } else if (parsed.type === 'error') {
                  onError?.(parsed.message || '出错了');
                } else if (parsed.choices?.[0]?.delta?.content) {
                  // DeepSeek 标准 SSE 格式
                  onChunk?.(parsed.choices[0].delta.content);
                }
              } catch {
                // 忽略解析失败的行
              }
            }
          }

          read();
        });
      }

      read();
    })
    .catch(err => {
      if (err.name === 'AbortError') return; // 用户主动取消
      onError?.(err.message || '请求失败');
    });

  return {
    abort: () => abortController.abort(),
  };
}
