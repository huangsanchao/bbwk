<template>
  <div class="home-view">
    <div class="chat-container">
      <!-- 欢迎语 -->
      <div v-if="messages.length === 0" class="welcome">
        <div class="welcome-icon"></div>
        <h1>BabyWiki 智能育儿助手</h1>
        <p>基于 500+ 篇专业育儿文章，为你解答育儿问题</p>
        <div class="quick-questions">
          <span class="qq-label">试试这样问：</span>
          <div class="qq-list">
            <button v-for="q in quickQuestions" :key="q" class="qq-btn" @click="askQuick(q)">
              {{ q }}
            </button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages" ref="messagesRef">
        <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
          <div class="message-avatar">
            <template v-if="msg.role === 'user'">👤</template>
            <template v-else></template>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="renderMarkdown(msg.content)"></div>
            <!-- 引用来源 -->
            <div v-if="msg.citations?.length" class="citations">
              <div class="citations-title">📖 引用来源</div>
              <div v-for="cite in msg.citations" :key="cite.index" class="citation-item">
                <router-link :to="'/articles/' + cite.slug">
                  [{{ cite.index }}] {{ cite.title }}
                  <el-tag size="small" style="margin-left: 4px">{{ cite.category }}</el-tag>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="message ai">
          <div class="message-avatar"></div>
          <div class="message-content">
            <div class="typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="chat-input">
        <textarea
          v-model="input"
          placeholder="问我任何育儿问题..."
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="autoResize"
          ref="inputRef"
        ></textarea>
        <el-button
          type="primary"
          :disabled="!input.trim() || loading"
          :loading="loading"
          @click="sendMessage"
        >
          <el-icon v-if="!loading"><Position /></el-icon>
          {{ loading ? '思考中...' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { streamChat } from '../api/chat.js';

const input = ref('');
const messages = ref([]);
const loading = ref(false);
const messagesRef = ref(null);
const inputRef = ref(null);
const chatHistory = ref([]);
let currentAbort = null;

const quickQuestions = [
  '宝宝几个月可以添加辅食？',
  '新生儿黄疸怎么办？',
  '孕期需要注意什么？',
  '宝宝发烧怎么护理？',
  '如何培养宝宝安全感？',
];

function askQuick(q) {
  input.value = q;
  sendMessage();
}

async function sendMessage() {
  const question = input.value.trim();
  if (!question || loading.value) return;

  // 添加用户消息
  messages.value.push({ role: 'user', content: question });
  input.value = '';
  loading.value = true;
  chatHistory.value.push({ role: 'user', content: question });

  // 添加 AI 消息占位
  const aiMsg = { role: 'ai', content: '', citations: [] };
  messages.value.push(aiMsg);

  await nextTick();
  scrollToBottom();

  // 流式请求
  let fullContent = '';
  currentAbort = streamChat(
    question,
    chatHistory.value.slice(-6),
    // onChunk
    (text) => {
      fullContent += text;
      aiMsg.content = fullContent;
      scrollToBottom();
    },
    // onDone
    (citations) => {
      aiMsg.citations = citations || [];
      chatHistory.value.push({ role: 'assistant', content: fullContent });
      loading.value = false;
      currentAbort = null;
      scrollToBottom();
      // 自动调整输入框高度
      if (inputRef.value) {
        inputRef.value.style.height = 'auto';
      }
    },
    // onError
    (err) => {
      aiMsg.content = `抱歉，出了点问题：${err}`;
      loading.value = false;
      currentAbort = null;
    }
  );
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}

function autoResize(e) {
  const el = e.target;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function renderMarkdown(text) {
  if (!text) return '';
  // 简单 markdown 渲染
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 列表
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // 换行
    .replace(/\n/g, '<br>');
  // 包裹连续的 <li>
  html = html.replace(/(<li>.*?<\/li>(<br>)?)+/g, (match) => {
    return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
  });
  return html;
}

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 198px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 欢迎页 */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  overflow: hidden;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.welcome h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px;
}

.welcome p {
  font-size: 15px;
  color: #909399;
  margin: 0 0 32px;
}

.quick-questions {
  width: 100%;
  max-width: 500px;
}

.qq-label {
  font-size: 13px;
  color: #909399;
  display: block;
  margin-bottom: 8px;
}

.qq-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.qq-btn {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.qq-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

/* 消息列表 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.messages::-webkit-scrollbar {
  width: 4px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 2px;
}

.messages:hover::-webkit-scrollbar-thumb {
  background: #dcdfe6;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.ai {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-size: 14px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.message.user .message-text {
  background: #409eff;
  color: #fff;
  border-top-right-radius: 4px;
}

.message.ai .message-text {
  background: #f5f7fa;
  color: #303133;
  border-top-left-radius: 4px;
}

.message-text ul {
  margin: 8px 0;
  padding-left: 20px;
}

.message-text li {
  margin: 4px 0;
}

/* 引用来源 */
.citations {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.citations-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.citation-item {
  font-size: 13px;
  margin: 4px 0;
}

.citation-item a {
  color: #409eff;
  text-decoration: none;
}

.citation-item a:hover {
  text-decoration: underline;
}

/* 打字动画 */
.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: bounce 1.4s infinite;
}

.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入框 */
.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
}

.chat-input textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  font-size: 14px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.2s;
  font-family: inherit;
}

.chat-input textarea:focus {
  border-color: #409eff;
}

.chat-input .el-button {
  height: auto;
  padding: 10px 20px;
  border-radius: 10px;
}
</style>
