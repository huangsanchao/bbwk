<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p>&copy; {{ new Date().getFullYear() }} BabyWiki 新手父母育儿知识库</p>
      <p class="footer-desc">用知识守护每一个新生命</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.footer-desc {
  margin-top: 4px;
  font-size: 12px;
}
</style>
