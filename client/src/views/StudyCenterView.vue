<template>
  <div class="study-center">
    <h1>📚 学习中心</h1>
    <p class="center-desc">系统化学习育儿知识，像考驾照一样循序渐进，边学边考</p>

    <!-- 学习进度总览 -->
    <div class="progress-overview">
      <div class="progress-card" v-for="plan in studyPlans" :key="plan.id">
        <div class="plan-icon">{{ plan.icon }}</div>
        <div class="plan-info">
          <h3>{{ plan.name }}</h3>
          <p>{{ plan.desc }}</p>
          <div class="progress-bar-wrap">
            <div class="progress-bar" :style="{ width: getPlanPercent(plan.id) + '%' }"></div>
          </div>
          <span class="progress-text">{{ getPlanCompleted(plan.id) }}/{{ getPlanTotal(plan.id) }} 课时</span>
        </div>
        <router-link :to="'/study/' + plan.id" class="plan-btn">
          {{ getPlanPercent(plan.id) > 0 ? '继续学习' : '开始学习' }}
        </router-link>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="quick-actions">
      <h2>🎯 快速入口</h2>
      <div class="action-grid">
        <router-link to="/quiz/practice" class="action-card">
          <div class="action-icon">📝</div>
          <h3>随练习</h3>
          <p>随机抽题，巩固记忆</p>
        </router-link>
        <router-link to="/quiz/exam" class="action-card">
          <div class="action-icon">📋</div>
          <h3>模拟考试</h3>
          <p>限时答题，检验成果</p>
        </router-link>
        <router-link to="/quiz/records" class="action-card">
          <div class="action-icon">📊</div>
          <h3>学习记录</h3>
          <p>查看考试成绩</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { studyPlans, getPlanProgress } from '../data/studyPlan.js';

function getPlanCompleted(planId) {
  return getPlanProgress(planId).completed;
}

function getPlanTotal(planId) {
  return getPlanProgress(planId).total;
}

function getPlanPercent(planId) {
  const { completed, total } = getPlanProgress(planId);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
</script>

<style scoped>
.study-center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.center-desc {
  color: #909399;
  margin-bottom: 32px;
  font-size: 15px;
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.progress-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  transition: box-shadow 0.2s;
}

.progress-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.plan-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.plan-info {
  flex: 1;
  min-width: 0;
}

.plan-info h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 4px;
}

.plan-info p {
  font-size: 13px;
  color: #909399;
  margin: 0 0 10px;
}

.progress-bar-wrap {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}

.plan-btn {
  padding: 8px 16px;
  background: #409eff;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s;
}

.plan-btn:hover {
  background: #66b1ff;
}

.quick-actions h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  text-decoration: none;
  transition: all 0.2s;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 15px;
  color: #303133;
  margin: 0 0 4px;
}

.action-card p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

@media (max-width: 768px) {
  .progress-overview {
    grid-template-columns: 1fr;
  }
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
