// 知识库预处理 — 文章切块 + 向量化 + 存入向量库
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { embed } from './deepseek.js';
import { vectorStore } from './vectorStore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 从 blocks 数组提取纯文本（文章数据格式为 blocks 而非 content）
 */
function blocksToText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map(block => {
      if (block.type === 'ul' && Array.isArray(block.items)) {
        return block.items.map(item => `• ${item}`).join('\n');
      }
      return block.text || '';
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * 解析 ESM 文章文件
 * 用动态 import 加载 ESM 模块，提取 articles 导出
 */
async function parseArticlesFile(filePath) {
  // 用 file:// URL 做 ESM import
  const fileUrl = 'file://' + filePath.replace(/\\/g, '/');
  const mod = await import(fileUrl);
  const articles = mod.articles || mod.default;
  if (!articles || !Array.isArray(articles)) throw new Error('无法解析文章数据');
  return articles;
}

/**
 * 中文文本切块
 * 策略：按段落切分，每块 500-800 字，保留文章上下文
 */
export function chunkArticle(article, maxChunkSize = 600) {
  const chunks = [];
  const fullText = `${article.title}\n${article.summary}\n${blocksToText(article.blocks)}`;

  // 按段落切分（双换行或单换行）
  const paragraphs = fullText.split(/\n\n+|\n(?=\S)/).filter(p => p.trim().length > 10);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `article-${article.id}-chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          articleId: article.id,
          articleTitle: article.title,
          articleSlug: article.slug,
          category: article.category,
          chunkIndex,
          tags: article.tags || [],
        },
      });
      chunkIndex++;
      currentChunk = para + '\n\n';
    } else {
      currentChunk += para + '\n\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `article-${article.id}-chunk-${chunkIndex}`,
      content: currentChunk.trim(),
      metadata: {
        articleId: article.id,
        articleTitle: article.title,
        articleSlug: article.slug,
        category: article.category,
        chunkIndex,
        tags: article.tags || [],
      },
    });
  }

  return chunks;
}

/**
 * 构建知识库索引
 */
export async function buildKnowledgeIndex(options = {}) {
  const {
    articlesPath = resolve(__dirname, '../../../client/src/data/articles.js'),
    outputPath = resolve(__dirname, './knowledge-index.json'),
    rebuild = true,
  } = options;

  console.log('📚 开始构建知识库索引...');

  // 1. 读取文章数据
  const articlesData = await parseArticlesFile(articlesPath);
  console.log(`📄 读取到 ${articlesData.length} 篇文章`);

  // 2. 切块
  let allChunks = [];
  for (const article of articlesData) {
    if (article.blocks) {
      const chunks = chunkArticle(article);
      allChunks = allChunks.concat(chunks);
    }
  }

  console.log(`📝 切分为 ${allChunks.length} 个 chunk`);

  if (rebuild) {
    vectorStore.clear();
  }

  // 3. 批量向量化（本地计算，无 API 限制）
  const batchSize = 50;
  let processed = 0;

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.content);

    try {
      const embeddings = await embed(texts);
      embeddings.forEach((emb, idx) => {
        const chunk = batch[idx];
        vectorStore.add(chunk.id, chunk.content, emb, chunk.metadata);
      });
      processed += batch.length;
      console.log(`  进度: ${processed}/${allChunks.length}`);
    } catch (err) {
      console.error(`  ❌ 批量向量化失败 (batch ${i}-${i + batchSize}):`, err.message);
    }
  }

  // 4. 保存索引
  vectorStore.save(outputPath);
  console.log(`✅ 知识库构建完成: ${vectorStore.size()} 个向量块`);
  console.log(`📁 索引已保存至: ${outputPath}`);

  return {
    totalChunks: vectorStore.size(),
    totalArticles: articlesData.length,
  };
}

/**
 * 加载已有索引
 */
export async function loadKnowledgeIndex(options = {}) {
  const {
    indexPath = resolve(__dirname, './knowledge-index.json'),
  } = options;

  try {
    const count = vectorStore.load(indexPath);
    console.log(`📚 知识库已加载: ${count} 个向量块`);
    return count;
  } catch {
    console.log('⚠️  未找到知识库索引，将自动构建...');
    const result = await buildKnowledgeIndex({ outputPath: indexPath });
    return result.totalChunks;
  }
}
