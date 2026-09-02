<template>
  <div class="article-detail-view">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="article">
      <div class="article-header">
        <div class="article-meta">
          <el-tag size="small" type="primary">{{ article.category }}</el-tag>
          <el-tag v-for="tag in article.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
          <span class="age-tag" v-if="article.ageRange">
            {{ formatAgeRange(article.ageRange) }}
          </span>
        </div>
        <h1>{{ article.title }}</h1>
        <div class="article-info">
          <span>作者：{{ article.author }}</span>
          <span>发布于：{{ article.publishedAt }}</span>
          <span>
            <el-icon><View /></el-icon> {{ article.viewCount }} 阅读
            <el-icon><ChatLineRound /></el-icon> {{ article.commentCount }} 评论
          </span>
        </div>
      </div>

      <el-divider />

      <div class="article-content">
        <div v-for="(block, i) in article.blocks" :key="i">
          <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
          <h3 v-if="block.type === 'h3'">{{ block.text }}</h3>
          <p v-if="block.type === 'p'">{{ block.text }}</p>
          <ul v-if="block.type === 'ul'">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>
          <blockquote v-if="block.type === 'quote'">{{ block.text }}</blockquote>
          <img
            v-if="block.type === 'img'"
            :src="block.src"
            :alt="block.alt"
            class="article-image"
          />
          <p v-if="block.type === 'caption'" class="image-caption">{{ block.text }}</p>
        </div>
      </div>

      <el-divider />

      <div class="article-actions">
        <el-button :type="liked ? 'primary' : ''" @click="handleLike">
          <el-icon><Star /></el-icon> 点赞 ({{ article.likeCount + (liked ? 1 : 0) }})
        </el-button>
        <el-button :type="collected ? 'warning' : ''" @click="handleCollect">
          <el-icon><StarFilled /></el-icon> 收藏
        </el-button>
        <el-button @click="handleShare">
          <el-icon><Share /></el-icon> 分享
        </el-button>
        <el-alert
          v-if="showAuthAlert"
          :title="authAlertText"
          type="warning"
          show-icon
          :closable="true"
          style="margin-top: 12px; max-width: 400px"
        >
          <template #default>
            <el-button type="primary" link size="small" @click="$router.push('/login')">
              登录
            </el-button>
            后可操作
          </template>
        </el-alert>
      </div>

      <!-- 相关文章 -->
      <div v-if="relatedArticles.length > 0" class="related-articles">
        <h2>相关文章推荐</h2>
        <div class="related-grid">
          <el-card
            v-for="rel in relatedArticles"
            :key="rel.id"
            shadow="hover"
            @click="$router.push(`/articles/${rel.slug}`)"
            class="related-card"
          >
            <h3>{{ rel.title }}</h3>
            <p>{{ rel.summary }}</p>
          </el-card>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comment-section">
        <h2>评论 ({{ article.commentCount }})</h2>

        <div v-if="!userStore.isLoggedIn" class="comment-login-prompt">
          <el-alert title="登录后才能发表评论" type="info" show-icon>
            <template #default>
              <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
              或
              <el-button type="primary" link @click="$router.push('/register')">注册</el-button>
            </template>
          </el-alert>
        </div>

        <div v-else class="comment-input-area">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
          />
          <el-button type="primary" style="margin-top: 8px" @click="handleComment">
            发表评论
          </el-button>
        </div>

        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-author">
              <el-avatar :size="32">{{ comment.author.charAt(0) }}</el-avatar>
              <span class="name">{{ comment.author }}</span>
              <span class="time">{{ comment.time }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </template>

    <el-empty v-else description="文章不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/user.js';
import { articleBySlug, getArticlesByCategory } from '../data/articles.js';
import { ElMessage } from 'element-plus';

const route = useRoute();
const userStore = useUserStore();
const loading = ref(true);
const article = ref(null);
const liked = ref(false);
const collected = ref(false);
const showAuthAlert = ref(false);
const authAlertText = ref('');
const commentContent = ref('');
const relatedArticles = ref([]);
const comments = ref([
  { id: 1, author: '新手妈妈小王', content: '很实用的文章，收藏了！', time: '2天前' },
  { id: 2, author: '奶爸小李', content: '我家宝宝正好这个阶段，太及时了。', time: '1天前' },
  { id: 3, author: '育儿达人', content: '补充一点：每个宝宝的发育节奏不同，不用太焦虑。', time: '5小时前' },
]);

function formatAgeRange(range) {
  if (!range || range.max === 0) return '全年龄段';
  if (range.min === range.max) return `${range.min}个月`;
  if (range.max >= 12 && range.min < 12) return `${range.min}个月-${range.max / 12}岁`;
  return `${range.min}-${range.max}个月`;
}

function handleLike() {
  if (!userStore.isLoggedIn) {
    authAlertText.value = '登录后才能点赞';
    showAuthAlert.value = true;
    return;
  }
  liked.value = !liked.value;
  ElMessage.success(liked.value ? '已点赞' : '已取消点赞');
}

function handleCollect() {
  if (!userStore.isLoggedIn) {
    authAlertText.value = '登录后才能收藏';
    showAuthAlert.value = true;
    return;
  }
  collected.value = !collected.value;
  ElMessage.success(collected.value ? '已收藏' : '已取消收藏');
}

function handleShare() {
  const url = window.location.href;
  navigator.clipboard?.writeText(url);
  ElMessage.success('链接已复制到剪贴板');
}

function handleComment() {
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }
  ElMessage.success('评论发表成功');
  commentContent.value = '';
}

onMounted(() => {
  const slug = route.params.slug;
  const found = articleBySlug[slug];
  if (found) {
    article.value = { ...found };
    relatedArticles.value = getArticlesByCategory(found.category)
      .filter(a => a.slug !== slug)
      .slice(0, 3);
  }
  loading.value = false;
});
</script>

<style scoped>
.article-detail-view {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  padding: 40px 0;
}

.article-header {
  margin-bottom: 24px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.age-tag {
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
}

.article-header h1 {
  font-size: 28px;
  margin: 0 0 16px;
  color: #303133;
  line-height: 1.4;
}

.article-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #909399;
  flex-wrap: wrap;
}

.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: #303133;
}

.article-content h2 {
  font-size: 22px;
  margin: 32px 0 16px;
  color: #303133;
}

.article-content h3 {
  font-size: 18px;
  margin: 24px 0 12px;
  color: #606266;
}

.article-content p {
  margin: 0 0 16px;
}

.article-content ul {
  margin: 0 0 16px 24px;
}

.article-content li {
  margin-bottom: 8px;
}

.article-content blockquote {
  margin: 20px 0;
  padding: 16px 20px;
  background: #f0f9eb;
  border-left: 4px solid #67c23a;
  border-radius: 0 4px 4px 0;
  color: #606266;
}

.article-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0 8px;
  display: block;
}

.image-caption {
  font-size: 13px;
  color: #909399;
  text-align: center;
  margin: 0 0 20px;
  font-style: italic;
}

.article-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.related-articles {
  margin: 40px 0;
}

.related-articles h2 {
  font-size: 22px;
  margin-bottom: 20px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.related-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.related-card:hover {
  transform: translateY(-2px);
}

.related-card h3 {
  font-size: 15px;
  margin: 0 0 8px;
  color: #303133;
}

.related-card p {
  font-size: 13px;
  color: #909399;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-section {
  margin-top: 40px;
}

.comment-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
}

.comment-login-prompt {
  margin-bottom: 24px;
}

.comment-input-area {
  margin-bottom: 24px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-author .name {
  font-weight: 600;
  color: #303133;
}

.comment-author .time {
  font-size: 13px;
  color: #909399;
}

.comment-content {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .article-header h1 {
    font-size: 22px;
  }
  .article-info {
    flex-direction: column;
    gap: 8px;
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
