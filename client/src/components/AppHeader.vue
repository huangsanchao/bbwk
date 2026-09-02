<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <el-icon :size="24"><BabyCarriage /></el-icon>
        <span>BabyWiki</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/articles" class="nav-item">知识库</router-link>
        <router-link to="/study" class="nav-item">学习中心</router-link>
      </nav>

      <div class="header-right">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索育儿知识..."
            size="default"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <template v-if="userStore.isLoggedIn">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="28" :src="userStore.avatar">
                {{ userStore.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userStore.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button text @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user.js';
import { logout as logoutApi } from '../api/auth.js';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const searchQuery = ref('');

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/articles', query: { q: searchQuery.value } });
  }
}

async function handleLogout() {
  try {
    await logoutApi();
  } catch {
    // 忽略服务端错误
  }
  userStore.logout();
  ElMessage.success('已退出登录');
  router.push('/');
}
</script>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-item {
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .search-box {
    display: none;
  }
}
</style>
