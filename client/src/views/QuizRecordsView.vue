<template>
  <div class="quiz-records">
    <el-button text @click="$router.push('/study')" style="margin-bottom: 16px">
      <el-icon><ArrowLeft /></el-icon> 返回学习中心
    </el-button>
    <h1>📊 学习记录</h1>
    <p class="records-desc">查看你的练习和考试历史</p>

    <!-- 统计卡片 -->
    <div class="stats-grid" v-if="records.length > 0">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value">{{ totalAttempts }}</div>
        <div class="stat-label">总次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">{{ bestScore }}</div>
        <div class="stat-label">最高分</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-value">{{ avgScore }}</div>
        <div class="stat-label">平均分</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{{ passRate }}%</div>
        <div class="stat-label">及格率</div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div class="category-stats" v-if="records.length > 0">
      <h3>分类成绩分布</h3>
      <div v-for="(stat, cat) in categoryBreakdown" :key="cat" class="category-row">
        <span class="category-name">{{ cat }}</span>
        <div class="category-bar-wrap">
          <div class="category-bar" :style="{ width: stat.avgPercent + '%', background: stat.barColor }"></div>
        </div>
        <span class="category-score">平均 {{ stat.avgScore }} 分（{{ stat.count }} 次）</span>
      </div>
    </div>

    <!-- 记录列表 -->
    <div v-if="records.length > 0" class="records-list">
      <h3>历史记录</h3>
      <el-table :data="pagedRecords" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="170">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type === 'exam' ? 'danger' : 'primary'" size="small">
              {{ row.type === 'exam' ? '考试' : '练习' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="correct" label="答对" width="70">
          <template #default="{ row }">
            {{ row.correct }}/{{ row.total }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="80">
          <template #default="{ row }">
            <span :class="scoreClass(row.score)">{{ row.score }}分</span>
          </template>
        </el-table-column>
        <el-table-column v-if="records.some(r => r.timeUsed)" label="用时" width="80">
          <template #default="{ row }">
            <span v-if="row.timeUsed">{{ formatTime(row.timeUsed) }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="10"
          :total="records.length"
          layout="prev, pager, next"
          small
        />
      </div>
    </div>

    <el-empty v-else description="暂无学习记录，快去练习吧！">
      <el-button type="primary" @click="$router.push('/quiz/practice')">开始练习</el-button>
    </el-empty>

    <div v-if="records.length > 0" class="clear-section">
      <el-button type="danger" text @click="clearRecords">清空记录</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentPage = ref(1);
const pageSize = 10;

const records = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('babywiki_quiz_records') || '[]')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
});

const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return records.value.slice(start, start + pageSize);
});

const totalAttempts = computed(() => records.value.length);

const bestScore = computed(() => {
  if (records.value.length === 0) return 0;
  return Math.max(...records.value.map(r => r.score));
});

const avgScore = computed(() => {
  if (records.value.length === 0) return 0;
  return Math.round(records.value.reduce((sum, r) => sum + r.score, 0) / records.value.length);
});

const passRate = computed(() => {
  if (records.value.length === 0) return 0;
  const passed = records.value.filter(r => r.score >= 60).length;
  return Math.round((passed / records.value.length) * 100);
});

const categoryBreakdown = computed(() => {
  const map = {};
  records.value.forEach(r => {
    if (!map[r.category]) map[r.category] = { scores: [], count: 0 };
    map[r.category].scores.push(r.score);
    map[r.category].count++;
  });
  const result = {};
  Object.keys(map).forEach(cat => {
    const scores = map[cat].scores;
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    let barColor = '#f56c6c';
    if (avg >= 90) barColor = '#67c23a';
    else if (avg >= 70) barColor = '#409eff';
    else if (avg >= 60) barColor = '#e6a23c';
    result[cat] = {
      avgScore: avg,
      avgPercent: avg,
      count: map[cat].count,
      barColor,
    };
  });
  return result;
});

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}分${sec}秒`;
}

function scoreClass(score) {
  if (score >= 90) return 'score-excellent';
  if (score >= 70) return 'score-good';
  if (score >= 60) return 'score-pass';
  return 'score-fail';
}

function clearRecords() {
  if (confirm('确定要清空所有学习记录吗？此操作不可撤销。')) {
    localStorage.removeItem('babywiki_quiz_records');
  }
}
</script>

<style scoped>
.quiz-records {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.quiz-records h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.records-desc {
  color: #909399;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.category-stats {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}

.category-stats h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 16px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.category-name {
  font-size: 14px;
  color: #303133;
  min-width: 60px;
}

.category-bar-wrap {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.category-score {
  font-size: 13px;
  color: #909399;
  min-width: 120px;
  text-align: right;
}

.records-list {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #ebeef5;
}

.records-list h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.score-excellent { color: #67c23a; font-weight: 600; }
.score-good { color: #409eff; font-weight: 600; }
.score-pass { color: #e6a23c; font-weight: 600; }
.score-fail { color: #f56c6c; font-weight: 600; }

.clear-section {
  text-align: center;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .category-row {
    flex-wrap: wrap;
  }
  .category-score {
    min-width: auto;
    text-align: left;
    width: 100%;
    margin-left: 72px;
  }
}
</style>
