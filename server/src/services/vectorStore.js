// 内存向量存储 — 余弦相似度检索（FAISS 轻量替代）
// 生产环境可替换为 pgvector / Milvus / Qdrant
import { readFileSync, writeFileSync } from 'fs';

export class VectorStore {
  constructor() {
    /** @type {Array<{id: string, content: string, embedding: number[], metadata: Object}>} */
    this.chunks = [];
  }

  /**
   * 添加文档块
   * @param {string} id - 唯一标识
   * @param {string} content - 文本内容
   * @param {number[]} embedding - 向量
   * @param {Object} metadata - 元数据 {articleId, articleTitle, category, chunkIndex}
   */
  add(id, content, embedding, metadata = {}) {
    this.chunks.push({ id, content, embedding, metadata });
  }

  /**
   * 批量添加
   */
  addBatch(items) {
    items.forEach(item => this.add(item.id, item.content, item.embedding, item.metadata));
  }

  /**
   * 清空所有向量
   */
  clear() {
    this.chunks = [];
  }

  /**
   * 获取数量
   */
  size() {
    return this.chunks.length;
  }

  /**
   * 相似度搜索（余弦相似度 Top-K）
   * @param {number[]} queryVector - 查询向量
   * @param {number} k - 返回数量
   * @returns {Array<{id, content, score, metadata}>}
   */
  search(queryVector, k = 5) {
    const scored = this.chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      metadata: chunk.metadata,
      score: cosineSimilarity(queryVector, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  /**
   * 持久化到文件
   */
  save(filePath) {
    // 只保存必要字段，避免超大文件
    const data = this.chunks.map(c => ({
      id: c.id,
      content: c.content,
      metadata: c.metadata,
      // embedding 用 Float32Array 压缩
      embedding: Array.from(new Float32Array(c.embedding)),
    }));
    writeFileSync(filePath, JSON.stringify(data), 'utf8');
    return data.length;
  }

  /**
   * 从文件加载
   */
  load(filePath) {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    this.chunks = data.map(item => ({
      ...item,
      embedding: Array.from(new Float32Array(item.embedding)),
    }));
    return this.chunks.length;
  }
}

/**
 * 余弦相似度
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// 全局单例
export const vectorStore = new VectorStore();
