// DeepSeek API 封装 — Chat + 本地 Embedding
import axios from 'axios';
import { config } from '../config/index.js';

const BASE_URL = 'https://api.deepseek.com/v1';
const API_KEY = config.deepseekApiKey;

// ==================== Chat ====================

/**
 * 流式调用 DeepSeek Chat
 * @param {Array} messages - 消息历史 [{role, content}]
 * @param {Object} options - {model, temperature, max_tokens, stream}
 * @returns {ReadableStream} Node.js stream
 */
export async function chat(messages, options = {}) {
  const response = await axios.post(
    `${BASE_URL}/chat/completions`,
    {
      model: options.model || 'deepseek-chat',
      messages,
      stream: true,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 1024,
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
    }
  );
  return response.data;
}

/**
 * 非流式调用 DeepSeek Chat
 */
export async function chatSync(messages, options = {}) {
  const response = await axios.post(
    `${BASE_URL}/chat/completions`,
    {
      model: options.model || 'deepseek-chat',
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 1024,
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

// ==================== 本地 Embedding (字符 n-gram) ====================
// DeepSeek 没有 embedding API，用字符 bigram 频率向量做本地检索

const VOCAB_SIZE = 4096;
let _hashCache = null;

function _hash(s) {
  // FNV-1a 变体 → 稳定哈希值
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function bigrams(text) {
  const result = [];
  for (let i = 0; i < text.length - 1; i++) {
    result.push(text[i] + text[i + 1]);
  }
  return result;
}

/**
 * 文本向量化（本地字符 bigram + TF，无需外部 API）
 * @param {string|string[]} texts - 文本或文本数组
 * @returns {number[][]} 归一化向量数组
 */
export async function embed(texts) {
  const list = Array.isArray(texts) ? texts : [texts];

  return list.map(text => {
    const vec = new Float32Array(VOCAB_SIZE);
    for (const bg of bigrams(text)) {
      const idx = _hash(bg) % VOCAB_SIZE;
      vec[idx] += 1;
    }
    // L2 归一化（cosine similarity 需要）
    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    return Array.from(vec);
  });
}
