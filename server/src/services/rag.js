// RAG 检索增强生成服务
import { Readable, Transform } from 'stream';
import { chat, embed } from './deepseek.js';
import { vectorStore } from './vectorStore.js';

/**
 * RAG 检索 + 生成
 * 1. 将用户问题向量化
 * 2. 检索 Top-K 相关文档块
 * 3. 构造 prompt 调用 LLM
 *
 * @param {string} question - 用户问题
 * @param {Object} options
 * @returns {ReadableStream} SSE 流
 */
export async function ragQuery(question, options = {}) {
  const {
    topK = 5,
    model = 'deepseek-chat',
    temperature = 0.3,
    maxTokens = 1024,
    history = [], // 对话历史 [{role, content}]
  } = options;

  // 1. 将问题向量化
  const [questionEmbedding] = await embed(question);

  // 2. 相似度检索
  const results = vectorStore.search(questionEmbedding, topK);

  // 过滤低相关度结果（阈值 0.12，适配本地 bigram 向量分布）
  const relevantChunks = results.filter(r => r.score > 0.12);

  if (relevantChunks.length === 0) {
    // 没有相关结果，直接返回
    const fallbackMessage = '抱歉，知识库中暂时没有与这个问题相关的内容。你可以试试换个问法，或者浏览知识库查找相关信息。';
    return createFallbackStream(fallbackMessage);
  }

  // 3. 构造 prompt
  const systemPrompt = buildSystemPrompt(relevantChunks);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6), // 保留最近 6 轮对话
    { role: 'user', content: question },
  ];

  // 4. 流式调用 LLM
  const stream = await chat(messages, { model, temperature, maxTokens });

  // 返回 SSE 流，附带引用来源
  return wrapStreamWithCitations(stream, relevantChunks);
}

/**
 * 构造系统 prompt
 */
function buildSystemPrompt(chunks) {
  const context = chunks
    .map((c, i) => `【来源${i + 1}】${c.metadata.articleTitle}（${c.metadata.category}）\n${c.content}`)
    .join('\n\n---\n\n');

  return `你是 BabyWiki 育儿知识助手，一个专业、温暖、可靠的育儿知识 AI 顾问。

## 你的任务
基于以下知识库片段回答用户的育儿问题。

## 知识库内容
${context}

## 回答规则
1. **只基于上述知识库内容回答**，不要编造信息
2. 如果知识库中没有相关内容，坦诚告知用户
3. 回答末尾标注引用来源，格式：[来源1]、[来源2] 等
4. 涉及医疗健康问题时，提醒用户"以上内容仅供参考，如有不适请及时就医"
5. 语言温暖亲切，像一位有经验的朋友在分享
6. 回答简洁有条理，使用分点列出关键信息`;
}

/**
 * 创建降级流（无相关内容时）
 */
function createFallbackStream(message) {
  const chunks = [
    `data: ${JSON.stringify({ type: 'content', text: message })}\n\n`,
    'data: [DONE]\n\n',
  ];
  const stream = Readable.from(chunks);
  return stream;
}

/**
 * 包装 LLM 流，添加引用来源信息
 */
function wrapStreamWithCitations(llmStream, citations) {
  let fullContent = '';
  let done = false;

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const text = chunk.toString();

      // DeepSeek SSE 格式: data: {...}\n\n
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            done = true;
            // 附加引用信息
            const citationData = JSON.stringify({
              type: 'citations',
              citations: citations.map((c, i) => ({
                index: i + 1,
                title: c.metadata.articleTitle,
                slug: c.metadata.articleSlug,
                category: c.metadata.category,
                score: Math.round(c.score * 100) / 100,
              })),
            });
            callback(null, `data: ${citationData}\n\n`);
            // 然后发送 DONE
            setTimeout(() => callback(null, 'data: [DONE]\n\n'), 10);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              fullContent += parsed.choices[0].delta.content;
            }
          } catch {
            // 非 JSON 行，直接转发
          }
        }
      }

      // 原始转发
      callback(null, chunk);
    },
  });

  llmStream.pipe(transform);
  return transform;
}
