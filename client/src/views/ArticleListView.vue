<template>
  <div class="article-list-view">
    <h1>全部文章</h1>

    <div class="filters">
      <el-select v-model="selectedCategory" placeholder="全部分类" clearable style="width: 140px">
        <el-option label="全部分类" value="" />
        <el-option v-for="cat in categoryList" :key="cat" :label="cat" :value="cat" />
      </el-select>
      <el-select v-model="selectedAge" placeholder="全部月龄" clearable style="width: 140px">
        <el-option label="全部月龄" value="" />
        <el-option label="备孕期" value="pre" />
        <el-option label="孕期" value="preg" />
        <el-option label="0-3月" value="0-3" />
        <el-option label="3-6月" value="3-6" />
        <el-option label="6-12月" value="6-12" />
        <el-option label="1-2岁" value="12-24" />
        <el-option label="2-3岁" value="24-36" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章..."
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div class="stats-bar">
      <span>共 <strong>{{ filteredArticles.length }}</strong> 篇文章</span>
      <el-tag v-if="selectedCategory" closable @close="selectedCategory = ''">{{ selectedCategory }}</el-tag>
      <el-tag v-if="searchQuery" closable @close="searchQuery = ''">{{ searchQuery }}</el-tag>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="filteredArticles.length === 0" class="empty">
      <el-empty description="没有找到相关文章" />
    </div>

    <div v-else class="article-grid">
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

    <div v-if="filteredArticles.length > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredArticles.length"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { articles, searchArticles } from '../data/articles.js';

const route = useRoute();

const categoryList = ['备孕', '产护', '喂养', '健康', '心理'];
const selectedCategory = ref('');
const selectedAge = ref('');
const searchQuery = ref('');
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 12;

const filteredArticles = computed(() => {
  let result = [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (selectedCategory.value) {
    result = result.filter(a => a.category === selectedCategory.value);
  }

  if (selectedAge.value) {
    const { min, max } = parseAgeRange(selectedAge.value);
    if (min !== null) {
      result = result.filter(a => {
        if (!a.ageRange) return false;
        if (a.ageRange.max === 0 && selectedAge.value !== 'pre' && selectedAge.value !== 'preg') return true;
        return a.ageRange.min <= max && a.ageRange.max >= min;
      });
    }
  }

  if (searchQuery.value) {
    result = searchArticles(searchQuery.value);
  }

  return result;
});

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredArticles.value.slice(start, start + pageSize);
});

function parseAgeRange(val) {
  const map = { pre: { min: 0, max: 0 }, preg: { min: 0, max: 0 } };
  if (map[val]) return map[val];
  const [min, max] = val.split('-').map(Number);
  return { min, max };
}

function formatAgeRange(range) {
  if (!range || range.max === 0) return '全年龄段';
  if (range.min === range.max) return `${range.min}个月`;
  if (range.max >= 12 && range.min < 12) return `${range.min}个月-${range.max / 12}岁`;
  return `${range.min}-${range.max}个月`;
}

function handleSearch() {
  currentPage.value = 1;
}

watch(
  () => route.query.q,
  (q) => {
    if (q) {
      searchQuery.value = q;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.article-list-view {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #303133;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #909399;
}

.stats-bar strong {
  color: #409eff;
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

.loading {
  padding: 40px 0;
}

.empty {
  padding: 60px 0;
}

@media (max-width: 768px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
  .filters {
    flex-direction: column;
  }
  .filters > * {
    width: 100% !important;
  }
}
</style>
