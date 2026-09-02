<template>
  <div class="category-view">
    <h1>
      <el-button text @click="$router.push('/articles')" style="margin-right: 8px">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      {{ currentCategory?.name || '全部文章' }}
    </h1>

    <p v-if="currentCategory" class="category-desc">{{ currentCategory.desc }}</p>

    <div class="article-grid">
      <el-card
        v-for="article in paginatedArticles"
        :key="article.id"
        class="article-card"
        shadow="hover"
        @click="$router.push(`/articles/${article.slug}`)"
      >
        <div class="article-body">
          <div class="article-meta">
            <el-tag size="small" type="primary" effect="plain">{{ article.category }}</el-tag>
            <el-tag v-for="tag in article.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            <span class="age-tag" v-if="article.ageRange">
              {{ formatAgeRange(article.ageRange) }}
            </span>
          </div>
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-footer">
            <span class="article-author">{{ article.author }}</span>
            <span class="article-date">{{ article.publishedAt }}</span>
            <span class="article-stats">
              <el-icon><View /></el-icon> {{ article.viewCount }}
              <el-icon><ChatLineRound /></el-icon> {{ article.commentCount }}
            </span>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-if="sortedArticles.length === 0" :description="`该分类下暂无文章`" />

    <div v-if="sortedArticles.length > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="sortedArticles.length"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getArticlesByCategory } from '../data/articles.js';

const route = useRoute();
const slug = route.params.slug;

const categoryMap = {
  'pre-pregnancy': { name: '备孕', desc: '备孕知识、营养调理、生活习惯、排卵监测' },
  prenatal: { name: '产护', desc: '孕期护理、产检指南、胎教知识、待产准备、产后月子' },
  feeding: { name: '喂养', desc: '母乳喂养、配方奶、辅食添加、睡眠规律、发育成长' },
  health: { name: '健康', desc: '常见疾病、疫苗接种、日常护理、急救知识' },
  psychology: { name: '心理', desc: '情绪管理、亲子关系、父母心理、产后抑郁' },
};

const currentCategory = slug ? categoryMap[slug] : null;

const pageSize = 12;
const currentPage = ref(1);

const sortedArticles = computed(() => {
  if (!currentCategory) return [];
  return getArticlesByCategory(currentCategory.name)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
});

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedArticles.value.slice(start, start + pageSize);
});

function formatAgeRange(range) {
  if (!range || range.max === 0) return '全年龄段';
  if (range.min === range.max) return `${range.min}个月`;
  if (range.max >= 12 && range.min < 12) return `${range.min}个月-${range.max / 12}岁`;
  return `${range.min}-${range.max}个月`;
}
</script>

<style scoped>
.category-view {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #303133;
  display: flex;
  align-items: center;
}

.category-desc {
  font-size: 16px;
  color: #909399;
  margin-bottom: 24px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.article-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
}

.article-body {
  padding: 16px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.age-tag {
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
}

.article-title {
  font-size: 16px;
  margin: 0 0 8px;
  color: #303133;
}

.article-summary {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;
  gap: 8px;
}

.article-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
