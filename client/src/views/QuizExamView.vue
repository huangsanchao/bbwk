<template>
  <div class="exam-view">
    <!-- 考前设置 -->
    <div v-if="!started" class="exam-setup">
      <el-button text @click="$router.push('/study')" style="margin-bottom: 16px">
        <el-icon><ArrowLeft /></el-icon> 返回学习中心
      </el-button>
      <h1> 模拟考试</h1>
      <p class="setup-desc">限时答题，检验学习成果，考后出成绩</p>

      <div class="setup-options">
        <div class="option-group">
          <label>选择题库分类</label>
          <el-select v-model="selectedCategory" placeholder="全部分类" style="width: 100%">
            <el-option label="全部分类" value="" />
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </div>
        <div class="exam-rules">
          <h3>考试规则</h3>
          <ul>
            <li>共 50 题，每题 2 分，满分 100 分</li>
            <li>限时 30 分钟，时间到自动交卷</li>
            <li>答题过程中不可暂停、不可查看答案</li>
            <li>60 分及格，85 分优秀</li>
          </ul>
        </div>
        <el-button type="danger" size="large" @click="startExam" style="width: 100%; margin-top: 16px">
          开始考试
        </el-button>
      </div>
    </div>

    <!-- 答题界面 -->
    <div v-else-if="!finished" class="exam-active">
      <div class="exam-header">
        <div class="exam-info">
          <span class="question-num">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
          <span class="quiz-category">{{ currentQuestion?.category }}</span>
        </div>
        <div class="timer" :class="{ urgent: timeLeft <= 60 }">
          <el-icon><Timer /></el-icon>
          <span>{{ formatTime(timeLeft) }}</span>
        </div>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }"></div>
      </div>

      <!-- 题号导航 -->
      <div class="question-nav">
        <div
          v-for="(_, i) in questions"
          :key="i"
          class="nav-dot"
          :class="{
            active: i === currentIndex,
            answered: answers[i] !== undefined
          }"
          @click="goToQuestion(i)"
        >
          {{ i + 1 }}
        </div>
      </div>

      <div class="question-card">
        <h2 class="question-text">{{ currentQuestion?.question }}</h2>

        <div class="options">
          <div
            v-for="(opt, i) in currentQuestion?.options"
            :key="i"
            class="option-item"
            :class="{ selected: answers[currentIndex] === i }"
            @click="selectAnswer(i)"
          >
            <span class="option-label">{{ ['A', 'B', 'C', 'D'][i] }}</span>
            <span class="option-text">{{ opt }}</span>
          </div>
        </div>

        <div class="exam-actions">
          <el-button v-if="currentIndex > 0" @click="prevQuestion">上一题</el-button>
          <el-button v-if="currentIndex < questions.length - 1" type="primary" @click="nextQuestion">
            下一题
          </el-button>
          <el-button v-else type="success" @click="submitExam">
            交卷
          </el-button>
        </div>
      </div>
    </div>

    <!-- 成绩界面 -->
    <div v-else class="exam-result">
      <div class="result-card">
        <div class="result-score" :class="scoreClass">
          <span class="score-num">{{ score }}</span>
          <span class="score-unit">分</span>
        </div>
        <h2>{{ resultTitle }}</h2>
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-value">{{ correctCount }}</span>
            <span class="stat-label">答对</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ questions.length - correctCount }}</span>
            <span class="stat-label">答错</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ timeUsed }}</span>
            <span class="stat-label">用时</span>
          </div>
        </div>
        <p class="result-summary">
          {{ questions.length }} 题，答对 {{ correctCount }} 题，正确率 {{ accuracy }}%
        </p>

        <div class="result-actions">
          <el-button type="primary" @click="showAnswers = !showAnswers">
            {{ showAnswers ? '隐藏解析' : '查看解析' }}
          </el-button>
          <el-button @click="restart">再考一次</el-button>
          <el-button @click="$router.push('/study')">返回学习中心</el-button>
        </div>
      </div>

      <!-- 答案解析 -->
      <div v-if="showAnswers" class="answer-review">
        <h3>答案解析</h3>
        <div v-for="(q, i) in questions" :key="i" class="answer-item" :class="{ wrong: answers[i] !== q.answer }">
          <div class="answer-question">
            <span class="q-num">{{ i + 1 }}.</span>
            <span>{{ q.question }}</span>
          </div>
          <p class="answer-info">
            你的答案：<span :class="answers[i] === q.answer ? 'correct-ans' : 'user-ans'">
              {{ answers[i] !== undefined ? ['A','B','C','D'][answers[i]] : '未作答' }}
            </span>
            正确答案：<span class="correct-ans">{{ ['A','B','C','D'][q.answer] }}</span>
          </p>
          <p class="answer-explain">{{ q.explanation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { questionBank, getRandomQuestions } from '../data/questionBank.js';

const categories = [...new Set(questionBank.map(q => q.category))];
const selectedCategory = ref('');

const started = ref(false);
const finished = ref(false);
const showAnswers = ref(false);
const questions = ref([]);
const answers = ref({});
const currentIndex = ref(0);
const score = ref(0);
const correctCount = ref(0);
const timeLeft = ref(30 * 60); // 30分钟
const totalTime = 30 * 60;
let timer = null;

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const timeUsed = computed(() => {
  const seconds = totalTime - timeLeft.value;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}分${sec.toString().padStart(2, '0')}秒`;
});

const accuracy = computed(() => {
  return questions.value.length > 0 ? Math.round((correctCount.value / questions.value.length) * 100) : 0;
});

const scoreClass = computed(() => {
  if (accuracy.value >= 90) return 'excellent';
  if (accuracy.value >= 85) return 'great';
  if (accuracy.value >= 70) return 'good';
  if (accuracy.value >= 60) return 'pass';
  return 'fail';
});

const resultTitle = computed(() => {
  if (accuracy.value >= 90) return '🏆 太优秀了！育儿专家级别！';
  if (accuracy.value >= 85) return '🎉 优秀！知识掌握扎实！';
  if (accuracy.value >= 70) return '👍 良好！继续加油！';
  if (accuracy.value >= 60) return '✅ 及格了！但还有提升空间';
  return '📚 未及格，建议重新学习相关章节';
});

function startExam() {
  questions.value = getRandomQuestions(50, selectedCategory.value);
  if (questions.value.length < 20) {
    alert('该分类下题目不足，请选择全部分类');
    return;
  }
  started.value = true;
  answers.value = {};
  currentIndex.value = 0;
  score.value = 0;
  correctCount.value = 0;
  timeLeft.value = 30 * 60;

  // 启动倒计时
  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(timer);
      submitExam();
    }
  }, 1000);
}

function selectAnswer(i) {
  answers.value[currentIndex.value] = i;
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function goToQuestion(i) {
  currentIndex.value = i;
}

function submitExam() {
  if (timer) clearInterval(timer);
  finished.value = true;

  // 计算得分
  let correct = 0;
  questions.value.forEach((q, i) => {
    if (answers.value[i] === q.answer) correct++;
  });
  correctCount.value = correct;
  score.value = correct * 2;

  // 保存考试记录
  try {
    const records = JSON.parse(localStorage.getItem('babywiki_quiz_records') || '[]');
    records.push({
      date: new Date().toISOString(),
      type: 'exam',
      category: selectedCategory.value || '全部',
      total: questions.value.length,
      correct,
      score: score.value,
      timeUsed: totalTime - timeLeft.value,
    });
    localStorage.setItem('babywiki_quiz_records', JSON.stringify(records));
  } catch {}
}

function restart() {
  finished.value = false;
  started.value = false;
  showAnswers.value = false;
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.exam-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 20px;
}

.exam-setup h1 {
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
  margin-bottom: 20px;
}

.option-group label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.exam-rules {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.exam-rules h3 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 8px;
}

.exam-rules ul {
  margin: 0;
  padding-left: 20px;
}

.exam-rules li {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.exam-info {
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

.timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.timer.urgent {
  color: #f56c6c;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.progress-bar-wrap {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-bottom: 16px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.nav-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-dot.active {
  background: #409eff;
  color: #fff;
}

.nav-dot.answered {
  background: #e8f5e9;
  color: #67c23a;
}

.nav-dot.active.answered {
  background: #67c23a;
  color: #fff;
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

.option-item:hover {
  border-color: #409eff;
  background: #f5f8ff;
}

.option-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
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

.option-text {
  font-size: 15px;
  color: #303133;
}

.exam-actions {
  display: flex;
  justify-content: space-between;
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

.excellent .score-num { color: #e6a23c; }
.great .score-num { color: #67c23a; }
.good .score-num { color: #409eff; }
.pass .score-num { color: #e6a23c; }
.fail .score-num { color: #f56c6c; }

.result-card h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 16px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.result-summary {
  color: #909399;
  margin: 0 0 24px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 答案解析 */
.answer-review {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ebeef5;
}

.answer-review h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 16px;
}

.answer-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.answer-item:last-child {
  border-bottom: none;
}

.answer-item.wrong {
  background: #fff8f8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
}

.answer-question {
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  gap: 6px;
}

.q-num {
  color: #909399;
  flex-shrink: 0;
}

.answer-info {
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

.answer-explain {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.6;
}
</style>
