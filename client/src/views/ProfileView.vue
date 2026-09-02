<template>
  <div class="profile-view">
    <el-card>
      <template #header>
        <h2>个人中心</h2>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">
          {{ userStore.user?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ userStore.user?.nickname || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.user?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag size="small">{{ userStore.user?.role }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="宝宝信息">
          <template v-if="userStore.user?.babyInfo?.birthday">
            {{ userStore.babyAge }} 个月
          </template>
          <template v-else>
            <el-button text type="primary" size="small">添加宝宝信息</el-button>
          </template>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user.js';

const userStore = useUserStore();
</script>

<style scoped>
.profile-view {
  max-width: 600px;
  margin: 0 auto;
}

.profile-view h2 {
  margin: 0;
  font-size: 20px;
}
</style>
