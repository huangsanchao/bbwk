<template>
  <nav class="mobile-tab-bar">
    <router-link to="/" class="tab-item" active-class="active">
      <el-icon :size="22"><HomeFilled /></el-icon>
      <span>首页</span>
    </router-link>
    <router-link to="/articles" class="tab-item" active-class="active">
      <el-icon :size="22"><Reading /></el-icon>
      <span>知识库</span>
    </router-link>
    <router-link to="/study" class="tab-item" active-class="active">
      <el-icon :size="22"><Notebook /></el-icon>
      <span>学习中心</span>
    </router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.mobile-tab-bar {
  display: none;
}

@media (max-width: 768px) {
  .mobile-tab-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: #fff;
    border-top: 1px solid #ebeef5;
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    text-decoration: none;
    color: #909399;
    font-size: 10px;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
  }

  .tab-item.active {
    color: #409eff;
  }

  .tab-item .el-icon {
    transition: transform 0.2s;
  }

  .tab-item.active .el-icon {
    transform: scale(1.1);
  }
}
</style>
