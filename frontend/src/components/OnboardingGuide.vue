<template>
  <el-card class="onboarding" shadow="never">
    <div class="onboarding-inner">
      <el-icon class="onboarding-icon"><CollectionTag /></el-icon>
      <h2 class="onboarding-title">开始收藏你的第一条链接</h2>
      <p class="onboarding-desc">
        这里还空着，把常用的网页收进来后，可以按分类和标签快速找回它们。
      </p>

      <div class="onboarding-actions">
        <el-button type="primary" size="large" @click="$emit('add-link')">
          <el-icon><Plus /></el-icon>
          添加第一条链接
        </el-button>
        <el-button size="large" @click="$router.push('/import')">
          <el-icon><Upload /></el-icon>
          导入浏览器书签
        </el-button>
      </div>

      <div class="onboarding-steps">
        <div class="step">
          <span class="step-index">1</span>
          <div class="step-text">
            <strong>添加或导入链接</strong>
            <span>手动填写 URL、标题和描述，或一次性导入 Chrome 书签文件</span>
          </div>
        </div>
        <div class="step">
          <span class="step-index">2</span>
          <div class="step-text">
            <strong>整理分类与标签</strong>
            <span>为链接选择分类、打上标签，之后在侧边栏和总览里一键筛选</span>
          </div>
        </div>
        <div class="step">
          <span class="step-index">3</span>
          <div class="step-text">
            <strong>随时搜索与检测</strong>
            <span>用关键词搜索链接，还可以在「死链检测」里找出失效的收藏</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineEmits(['add-link'])
</script>

<style scoped>
.onboarding {
  border: 1px dashed #dcdfe6;
}

.onboarding-inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 16px;
  text-align: center;
}

.onboarding-icon {
  font-size: 56px;
  color: #409eff;
  margin-bottom: 16px;
}

.onboarding-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.onboarding-desc {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.onboarding-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  max-width: 520px;
  margin: 0 auto;
}

.step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ecf5ff;
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-text strong {
  font-size: 14px;
  color: #303133;
}

.step-text span {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}
</style>
