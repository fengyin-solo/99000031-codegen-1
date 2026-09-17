<template>
  <div class="overview-board">
    <div class="board-greeting">
      <h2 class="board-title">收藏总览</h2>
      <p class="board-subtitle">
        共收藏 {{ linksStore.accountTotal }} 条链接 · 点击任意板块查看对应的链接
      </p>
    </div>

    <div class="board-grid">
      <!-- 分类 -->
      <el-card class="board-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-title">
              <el-icon><Files /></el-icon>
              <span>分类</span>
            </div>
            <el-button text size="small" @click="showAllLinks">
              查看全部
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>

        <div v-if="linksStore.categories.length" class="tile-list">
          <button
            type="button"
            class="tile category-tile"
            :class="{ active: !linksStore.selectedCategory && !linksStore.selectedTag }"
            @click="showAllLinks"
          >
            <span class="tile-dot" style="background-color: #909399"></span>
            <span class="tile-name">全部链接</span>
            <span class="tile-count">{{ linksStore.accountTotal }}</span>
          </button>
          <button
            v-for="cat in topCategories"
            :key="cat.id"
            type="button"
            class="tile category-tile"
            :class="{ active: linksStore.selectedCategory === cat.id }"
            @click="linksStore.setCategory(cat.id)"
          >
            <span class="tile-dot" :style="{ backgroundColor: cat.color }"></span>
            <span class="tile-name">{{ cat.name }}</span>
            <span class="tile-count">{{ cat.link_count }}</span>
          </button>
        </div>
        <div v-else class="board-empty-hint">还没有分类，添加链接时可以顺手创建</div>
      </el-card>

      <!-- 常用标签 -->
      <el-card class="board-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-title">
              <el-icon><PriceTag /></el-icon>
              <span>常用标签</span>
            </div>
          </div>
        </template>

        <div v-if="linksStore.tags.length" class="tag-tiles">
          <button
            v-for="tag in topTags"
            :key="tag.tag"
            type="button"
            class="tag-chip"
            :class="{ active: linksStore.selectedTag === tag.tag }"
            @click="linksStore.setTag(tag.tag)"
          >
            <span>{{ tag.tag }}</span>
            <span class="tag-count">{{ tag.count }}</span>
          </button>
        </div>
        <div v-else class="board-empty-hint">还没有标签，给链接加上标签后会出现在这里</div>
      </el-card>

      <!-- 最近收藏 -->
      <el-card class="board-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-title">
              <el-icon><Clock /></el-icon>
              <span>最近收藏</span>
            </div>
            <el-button text size="small" @click="showAllLinks">
              查看全部
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>

        <div v-if="linksStore.recentLinks.length" class="recent-list">
          <div
            v-for="link in linksStore.recentLinks"
            :key="link.id"
            class="recent-item"
            role="button"
            tabindex="0"
            @click="showAllLinks"
            @keyup.enter="showAllLinks"
          >
            <div class="recent-info">
              <span class="recent-title">{{ link.title }}</span>
              <span class="recent-meta">
                <span>{{ formatHost(link.url) }}</span>
                <span v-if="link.category_name" class="recent-category">· {{ link.category_name }}</span>
                <span class="recent-date">· {{ formatDate(link.created_at) }}</span>
              </span>
            </div>
            <a
              class="recent-open"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              title="打开链接"
              @click.stop
            >
              <el-icon><TopRight /></el-icon>
            </a>
          </div>
        </div>
        <div v-else class="board-empty-hint">最近还没有收进来新的链接</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLinksStore } from '../stores/links'

const linksStore = useLinksStore()

const topCategories = computed(() => linksStore.categories.slice(0, 6))
const topTags = computed(() => linksStore.tags.slice(0, 10))

function showAllLinks() {
  linksStore.clearFilters()
  linksStore.setViewMode('list')
}

function formatHost(url) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  const now = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)
  if (diffDays <= 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 30) return `${diffDays} 天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.board-greeting {
  margin-bottom: 16px;
}

.board-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #303133;
}

.board-subtitle {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1100px) {
  .board-grid {
    grid-template-columns: 1fr;
  }
}

.board-card {
  height: 100%;
}

.board-card :deep(.el-card__header) {
  padding: 12px 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.tile-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tile {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  font: inherit;
}

.tile:hover {
  border-color: #c6e2ff;
  background: #f5faff;
}

.tile.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.tile-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tile-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-count {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.tile.active .tile-count {
  background: #d9ecff;
  color: #409eff;
}

.tag-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;
}

.tag-chip:hover {
  border-color: #c6e2ff;
  color: #409eff;
  background: #f5faff;
}

.tag-chip.active {
  border-color: #409eff;
  background: #409eff;
  color: #fff;
}

.tag-count {
  font-size: 12px;
  opacity: 0.7;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recent-item:hover,
.recent-item:focus {
  background: #f5f7fa;
  outline: none;
}

.recent-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-title {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-item:hover .recent-title {
  color: #409eff;
}

.recent-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
}

.recent-open {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: #909399;
  padding: 4px;
  border-radius: 4px;
}

.recent-open:hover {
  color: #409eff;
  background: #ecf5ff;
}

.board-empty-hint {
  font-size: 13px;
  color: #909399;
  padding: 12px 0;
  text-align: center;
}
</style>
