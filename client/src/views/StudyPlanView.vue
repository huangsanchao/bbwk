<template>
  <div class="study-plan-view">
    <div class="plan-header">
      <el-button text @click="$router.push('/study')" style="margin-right: 8px">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h1>{{ plan?.icon }} {{ plan?.name }}</h1>
      <p>{{ plan?.desc }}</p>
    </div>

    <!-- 总进度 -->
    <div class="total-progress">
      <div class="progress-info">
        <span>总进度</span>
        <span>{{ planProgress.completed }} / {{ planProgress.total }} 课时</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: planPercent + '%' }"></div>
      </div>
    </div>

    <!-- 学习阶段 -->
    <div class="stages">
      <div v-for="(stage, si) in plan?.stages" :key="si" class="stage">
        <div class="stage-header">
          <h2>{{ stage.name }}</h2>
          <p>{{ stage.desc }}</p>
          <span class="stage-progress">
            {{ getStageProgress(plan.id, si) }} / {{ stage.lessons.length }} 已完成
          </span>
        </div>

        <div class="lessons">
          <div
            v-for="(lesson, li) in stage.lessons"
            :key="li"
            class="lesson-item"
            :class="{ read: isLessonRead(plan.id, si, li) }"
          >
            <div class="lesson-status">
              <el-icon v-if="isLessonRead(plan.id, si, li)" class="read-icon"><Check /></el-icon>
              <span v-else class="lesson-num">{{ li + 1 }}</span>
            </div>
            <div class="lesson-content">
              <h3>{{ lesson.title }}</h3>
              <p v-if="lesson.slug" class="lesson-link">
                <router-link :to="'/articles/' + lesson.slug">
                  <el-icon><Reading /></el-icon> 阅读文章
                </router-link>
              </p>
            </div>
            <el-button
              :type="isLessonRead(plan.id, si, li) ? 'success' : 'primary'"
              size="small"
              @click="toggleRead(plan.id, si, li)"
            >
              {{ isLessonRead(plan.id, si, li) ? '已学完' : '标记已学' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { studyPlans, isLessonRead, markLessonRead, getProgress, getPlanProgress } from '../data/studyPlan.js';

const route = useRoute();
const planId = parseInt(route.params.id);
const plan = studyPlans.find(p => p.id === planId);
const planProgress = computed(() => plan ? getPlanProgress(planId) : { completed: 0, total: 0 });
const planPercent = computed(() => {
  const { completed, total } = planProgress.value;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

function getStageProgress(pid, si) {
  const progress = getProgress();
  const key = `${pid}-${si}`;
  return progress[key] ? progress[key].length : 0;
}

function toggleRead(pid, si, li) {
  markLessonRead(pid, si, li);
}
</script>

<style scoped>
.study-plan-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.plan-header {
  margin-bottom: 24px;
}

.plan-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 8px 0 4px;
}

.plan-header p {
  color: #909399;
  margin: 0;
}

.total-progress {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.progress-bar-wrap {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 4px;
  transition: width 0.3s;
}

.stages {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stage {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.stage-header {
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.stage-header h2 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 4px;
}

.stage-header p {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px;
}

.stage-progress {
  font-size: 13px;
  color: #409eff;
}

.lessons {
  padding: 12px 20px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.lesson-item:last-child {
  border-bottom: none;
}

.lesson-item.read {
  opacity: 0.7;
}

.lesson-status {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: #909399;
}

.lesson-item.read .lesson-status {
  background: #e8f5e9;
  color: #67c23a;
}

.read-icon {
  font-size: 18px;
}

.lesson-content {
  flex: 1;
  min-width: 0;
}

.lesson-content h3 {
  font-size: 15px;
  color: #303133;
  margin: 0 0 4px;
}

.lesson-link a {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.lesson-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .lesson-item {
    flex-wrap: wrap;
  }
  .lesson-item .el-button {
    margin-left: 44px;
  }
}
</style>
