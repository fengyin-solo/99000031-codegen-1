<template>
  <div class="empty-guide">
    <el-icon class="guide-icon"><Star /></el-icon>
    <h2 class="guide-title">开始收藏你的第一条链接</h2>
    <p class="guide-desc">把常用网址收进来，按分类和标签整理，之后随时能搜到。</p>

    <div class="guide-steps">
      <div class="guide-step">
        <div class="step-no">1</div>
        <div class="step-body">
          <div class="step-title">添加链接</div>
          <div class="step-text">点击右上角「添加链接」，填入网址、标题，再选个分类或标签。</div>
        </div>
      </div>
      <div class="guide-step">
        <div class="step-no">2</div>
        <div class="step-body">
          <div class="step-title">建立分类与标签</div>
          <div class="step-text">在左侧边栏新建分类（如「工作」「学习」），添加链接时用标签进一步归类。</div>
        </div>
      </div>
      <div class="guide-step">
        <div class="step-no">3</div>
        <div class="step-body">
          <div class="step-title">批量导入书签</div>
          <div class="step-text">已经有浏览器书签？前往「导入书签」页面，上传 Chrome 导出的 HTML 文件即可批量收录。</div>
        </div>
      </div>
    </div>

    <div class="guide-actions">
      <el-button type="primary" size="large" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        添加第一条链接
      </el-button>
      <el-button size="large" @click="$emit('import')">
        <el-icon><Upload /></el-icon>
        导入浏览器书签
      </el-button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add', 'import'])
</script>

<style scoped>
.empty-guide {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 48px 32px;
  text-align: center;
  max-width: 720px;
  margin: 24px auto;
}

.guide-icon {
  font-size: 52px;
  color: #409eff;
}

.guide-title {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #303133;
}

.guide-desc {
  margin: 0 0 28px;
  font-size: 14px;
  color: #909399;
}

.guide-steps {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.guide-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-no {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ecf5ff;
  color: #409eff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.step-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.guide-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
