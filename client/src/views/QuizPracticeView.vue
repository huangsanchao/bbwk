<template>
  <div class="quiz-view">
    <!-- 开始界面 -->
    <div v-if="!started" class="quiz-setup">
      <el-button text @click="$router.push('/study')" style="margin-bottom: 16px">
        <el-icon><ArrowLeft /></el-icon> 返回学习中心
      </el-button>
      <h1>📝 随机练习</h1>
      <p class="setup-desc">随机抽题，答完即看解析，边做边学边记忆</p>

      <div class="setup-options">
        <div class="option-group">
          <label>选择题库分类</label>
          <el-select v-model="selectedCategory" placeholder="全部分类" style="width: 100%">
            <el-option label="全部分类" value="" />
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </div>
        <div class="option-group">
          <label>题目数量</label>
          <el-select v-model="questionCount" style="width: 100%">
            <el-option label="10 题" :value="10" />
            <el-option label="20 题" :value="20" />
            <el-option label="30 题" :value="30" />
            <el-option label="50 题" :value="50" />
          </el-select>
        </div>
        <div class="question-count-info">
          题库共 <strong>{{ totalQuestions }}</strong> 题
          <span v-if="selectedCategory">（{{ selectedCategory }}：{{ categoryCount }} 题）</span>
        </div>
        <el-button type="primary" size="large" @click="startPractice" style="width: 100%; margin-top: 16px">
          开始练习
        </el-button>
      </div>
    </div>

    <!-- 答题界面 -->
    <div v-else-if="!finished" class="quiz-active">
      <div class="quiz-header">
        <div class="quiz-info">
          <span class="question-num">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
          <span class="quiz-category">{{ currentQuestion?.category }}</span>
        </div>
        <el-button text @click="quitQuiz">退出练习</el-button>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }"></div>
      </div>

      <div class="question-card">
        <h2 class="question-text">{{ currentQuestion?.question }}</h2>

        <div class="options">
          <div
            v-for="(opt, i) in currentQuestion?.options"
            :key="i"
            class="option-item"
            :class="{
              selected: selectedAnswer === i,
              correct: answered && i === currentQuestion?.answer,
              wrong: answered && selectedAnswer === i && i !== currentQuestion?.answer
            }"
            @click="selectAnswer(i)"
          >
            <span class="option-label">{{ ['A', 'B', 'C', 'D'][i] }}</span>
            <span class="option-text">{{ opt }}</span>
          </div>
        </div>

        <!-- 解析 -->
        <div v-if="answered" class="explanation">
          <div class="explanation-header">
            <el-icon v-if="isCorrect" class="correct-icon"><CircleCheckFilled /></el-icon>
            <el-icon v-else class="wrong-icon"><CircleCloseFilled /></el-icon>
            <span>{{ isCorrect ? '回答正确！' : '回答错误' }}</span>
          </div>
          <p class="explanation-text">{{ currentQuestion?.explanation }}</p>
        </div>

        <!-- 下一题按钮 -->
        <div v-if="answered" class="quiz-actions">
          <el-button v-if="currentIndex < questions.length - 1" type="primary" @click="nextQuestion">
            下一题
          </el-button>
          <el-button v-else type="success" @click="finishQuiz">
            完成练习
          </el-button>
        </div>
      </div>
    </div>

    <!-- 结果界面 -->
    <div v-else class="quiz-result">
      <div class="result-card">
        <div class="result-score" :class="scoreClass">
          <span class="score-num">{{ score }}</span>
          <span class="score-unit">分</span>
        </div>
        <h2>{{ resultTitle }}</h2>
        <p class="result-summary">
          答对 {{ correctCount }} 题，答错 {{ questions.length - correctCount }} 题，正确率 {{ accuracy }}%
        </p>

        <div class="result-actions">
          <el-button type="primary" @click="restart">再来一轮</el-button>
          <el-button @click="$router.push('/study')">返回学习中心</el-button>
        </div>
      </div>

      <!-- 错题回顾 -->
      <div v-if="wrongQuestions.length > 0" class="wrong-review">
        <h3>❌ 错题回顾（{{ wrongQuestions.length }} 题）</h3>
        <div v-for="(q, i) in wrongQuestions" :key="i" class="wrong-item">
          <p class="wrong-question">{{ q.question }}</p>
          <p class="wrong-answer">
            你的答案：<span class="user-ans">{{ q.userAnswer !== undefined ? ['A','B','C','D'][q.userAnswer] : '未作答' }}</span>
            正确答案：<span class="correct-ans">{{ ['A','B','C','D'][q.answer] }}</span>
          </p>
          <p class="wrong-explain">{{ q.explanation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { questionBank, getQuestionsByCategory, getRandomQuestions, getCategoryStats, getAllQuestionsByCategory } from '../data/questionBank.js';
import { ElMessage } from 'element-plus';

const categoryStats = getCategoryStats();
const categories = Object.keys(categoryStats);
const selectedCategory = ref('');
const questionCount = ref(20);

const totalQuestions = questionBank.length;
const categoryCount = computed(() => {
  return selectedCategory.value ? categoryStats[selectedCategory.value] || 0 : 0;
});

const started = ref(false);
const finished = ref(false);
const questions = ref([]);
const currentIndex = ref(0);
const selectedAnswer = ref(-1);
const answered = ref(false);
const score = ref(0);
const correctCount = ref(0);

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isCorrect = computed(() => selectedAnswer.value === currentQuestion.value?.answer);

const wrongQuestions = computed(() => {
  return questions.value
    .filter(q => q._userAnswer !== q.answer)
    .map(q => ({ ...q, userAnswer: q._userAnswer }));
});

const accuracy = computed(() => {
  return questions.value.length > 0 ? Math.round((correctCount.value / questions.value.length) * 100) : 0;
});

const scoreClass = computed(() => {
  if (accuracy.value >= 90) return 'excellent';
  if (accuracy.value >= 70) return 'good';
  if (accuracy.value >= 50) return 'pass';
  return 'fail';
});

const resultTitle = computed(() => {
  if (accuracy.value >= 90) return '🎉 太棒了！你是育儿达人！';
  if (accuracy.value >= 70) return '👍 不错！继续加油！';
  if (accuracy.value >= 50) return '💪 还需要多练习哦';
  return '📚 建议重新学习相关章节';
});

function startPractice() {
  const count = selectedCategory.value
    ? Math.min(questionCount.value, categoryStats[selectedCategory.value] || 0)
    : questionCount.value;

  if (selectedCategory.value) {
    questions.value = getQuestionsByCategory(selectedCategory.value, count);
  } else {
    questions.value = getRandomQuestions(count);
  }
  if (questions.value.length === 0) {
    ElMessage.warning('该分类下暂无题目');
    return;
  }
  started.value = true;
  currentIndex.value = 0;
  selectedAnswer.value = -1;
  answered.value = false;
  score.value = 0;
  correctCount.value = 0;
}

function selectAnswer(i) {
  if (answered.value) return;
  selectedAnswer.value = i;
  answered.value = true;
  questions.value[currentIndex.value]._userAnswer = i;
  if (i === currentQuestion.value.answer) {
    correctCount.value++;
  }
}

function nextQuestion() {
  currentIndex.value++;
  selectedAnswer.value = -1;
  answered.value = false;
}

function finishQuiz() {
  finished.value = true;
  score.value = Math.round((correctCount.value / questions.value.length) * 100);
  // 保存练习记录
  try {
    const records = JSON.parse(localStorage.getItem('babywiki_quiz_records') || '[]');
    records.push({
      date: new Date().toISOString(),
      type: 'practice',
      category: selectedCategory.value || '全部',
      total: questions.value.length,
      correct: correctCount.value,
      score: score.value,
    });
    localStorage.setItem('babywiki_quiz_records', JSON.stringify(records));
  } catch {}
}

function restart() {
  finished.value = false;
  started.value = false;
}

function quitQuiz() {
  if (confirm('确定要退出练习吗？当前进度不会保存')) {
    started.value = false;
    finished.value = false;
  }
}
</script>

<style scoped>
.quiz-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 20px;
}

.quiz-setup h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.setup-desc {
  color: #909399;
  margin-bottom: 32px;
}

.setup-options {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ebeef5;
}

.option-group {
  margin-bottom: 16px;
}

.option-group label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.question-count-info {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quiz-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.question-num {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.quiz-category {
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 10px;
  border-radius: 12px;
}

.progress-bar-wrap {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-bottom: 24px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.question-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ebeef5;
}

.question-text {
  font-size: 17px;
  color: #303133;
  margin: 0 0 20px;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #ebeef5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover:not(.correct):not(.wrong) {
  border-color: #409eff;
  background: #f5f8ff;
}

.option-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.option-item.correct {
  border-color: #67c23a;
  background: #f0f9eb;
}

.option-item.wrong {
  border-color: #f56c6c;
  background: #fef0f0;
}

.option-label {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: #409eff;
  color: #fff;
}

.option-item.correct .option-label {
  background: #67c23a;
  color: #fff;
}

.option-item.wrong .option-label {
  background: #f56c6c;
  color: #fff;
}

.option-text {
  font-size: 15px;
  color: #303133;
}

.explanation {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.correct-icon { color: #67c23a; font-size: 20px; }
.wrong-icon { color: #f56c6c; font-size: 20px; }

.explanation-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
  margin: 0;
}

.quiz-actions {
  display: flex;
  justify-content: center;
}

/* 结果页 */
.result-card {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
}

.result-score {
  margin-bottom: 16px;
}

.score-num {
  font-size: 64px;
  font-weight: 700;
}

.score-unit {
  font-size: 20px;
  color: #909399;
}

.excellent .score-num { color: #67c23a; }
.good .score-num { color: #409eff; }
.pass .score-num { color: #e6a23c; }
.fail .score-num { color: #f56c6c; }

.result-card h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 8px;
}

.result-summary {
  color: #909399;
  margin: 0 0 24px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.wrong-review {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ebeef5;
}

.wrong-review h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 16px;
}

.wrong-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.wrong-item:last-child {
  border-bottom: none;
}

.wrong-question {
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  margin: 0 0 8px;
}

.wrong-answer {
  font-size: 14px;
  margin: 0 0 8px;
}

.user-ans {
  color: #f56c6c;
  font-weight: 600;
}

.correct-ans {
  color: #67c23a;
  font-weight: 600;
}

.wrong-explain {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.6;
}
</style>
