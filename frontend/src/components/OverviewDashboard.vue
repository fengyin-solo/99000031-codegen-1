<template>
  <div class="overview-dashboard">
    <!-- 概览统计 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{{ linksStore.total }}</div>
        <div class="stat-label">收藏链接</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ linksStore.categories.length }}</div>
        <div class="stat-label">分类</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ linksStore.tags.length }}</div>
        <div class="stat-label">标签</div>
      </div>
    </div>

    <el-row :gutter="16">
      <!-- 分类 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">分类</span>
              <el-button text size="small" @click="viewAllCategories">全部</el-button>
            </div>
          </template>
          <div v-if="linksStore.categoriesError" class="panel-tip">
            分类加载失败，已保留上次内容，可
            <el-button link type="primary" @click="$emit('reload')">重新加载</el-button>
          </div>
          <ul v-else class="tile-list">
            <li
              class="tile"
              :class="{ active: !linksStore.selectedCategory && !linksStore.selectedTag && !linksStore.searchQuery }"
              @click="selectAll"
            >
              <span class="tile-dot" style="background: #909399"></span>
              <span class="tile-name">全部链接</span>
              <span class="tile-count">{{ linksStore.total }}</span>
            </li>
            <li
              v-for="cat in linksStore.categories"
              :key="cat.id"
              class="tile"
              :class="{ active: linksStore.selectedCategory === cat.id }"
              @click="selectCategory(cat.id)"
            >
              <span class="tile-dot" :style="{ background: cat.color }"></span>
              <span class="tile-name">{{ cat.name }}</span>
              <span class="tile-count">{{ cat.link_count }}</span>
            </li>
          </ul>
        </el-card>
      </el-col>

      <!-- 常用标签 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">常用标签</span>
              <el-button v-if="linksStore.selectedTag" text size="small" @click="selectTag(null)">清除</el-button>
            </div>
          </template>
          <div v-if="linksStore.tagsError" class="panel-tip">
            标签加载失败，已保留上次内容，可
            <el-button link type="primary" @click="$emit('reload')">重新加载</el-button>
          </div>
          <div v-else-if="linksStore.tags.length === 0" class="panel-tip muted">
            还没有标签，添加链接时可以顺手打上标签
          </div>
          <div v-else class="tag-tiles">
            <button
              v-for="tag in linksStore.tags.slice(0, 12)"
              :key="tag.tag"
              type="button"
              class="tag-tile"
              :class="{ active: linksStore.selectedTag === tag.tag }"
              @click="selectTag(tag.tag)"
            >
              {{ tag.tag }}
              <span class="tag-count">{{ tag.count }}</span>
            </button>
          </div>
        </el-card>
      </el-col>

      <!-- 最近收藏 -->
      <el-col :xs="24" :sm="24" :lg="8">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">最近收藏</span>
              <el-button text size="small" @click="viewRecent">查看全部</el-button>
            </div>
          </template>
          <div v-if="linksStore.recentError" class="panel-tip">
            最近收藏加载失败，已保留上次内容，可
            <el-button link type="primary" @click="$emit('reload')">重新加载</el-button>
          </div>
          <ul v-else class="recent-list">
            <li v-for="link in linksStore.recentLinks" :key="link.id" class="recent-item">
              <a class="recent-link" :href="link.url" target="_blank" rel="noopener noreferrer">
                <span class="recent-title">{{ link.title }}</span>
                <span class="recent-host">{{ hostOf(link.url) }}</span>
              </a>
              <div class="recent-meta">
                <el-tag
                  v-if="link.category_name"
                  size="small"
                  effect="dark"
                  :color="link.category_color"
                  @click="selectCategory(link.category_id)"
                >
                  {{ link.category_name }}
                </el-tag>
                <el-tag
                  v-for="t in (link.tags || []).slice(0, 3)"
                  :key="t"
                  size="small"
                  effect="plain"
                  @click="selectTag(t)"
                >
                  {{ t }}
                </el-tag>
              </div>
            </li>
            <li v-if="linksStore.recentLinks.length === 0" class="panel-tip muted">
              最近还没有收藏
            </li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useLinksStore } from '../stores/links'

defineEmits(['reload'])

const linksStore = useLinksStore()

function hostOf(url) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

// 点任意一块 → 用同一套选择切到列表
function selectCategory(id) {
  linksStore.setCategory(id)
  linksStore.showList()
}

function selectTag(tag) {
  linksStore.setTag(tag)
  linksStore.showList()
}

function selectAll() {
  linksStore.clearFilters()
  linksStore.showList()
}

function viewAllCategories() {
  linksStore.showList()
}

// 「最近收藏」本身就是列表的默认次序：清掉筛选后进入列表
function viewRecent() {
  linksStore.clearFilters()
  linksStore.showList()
}
</script>

<style scoped>
.overview-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat-item {
  flex: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  text-align: center;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}

.panel {
  height: 100%;
  border: 1px solid #ebeef5;
}

.panel :deep(.el-card__body) {
  max-height: 340px;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.tile-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tile:hover {
  background-color: #f5f7fa;
}

.tile.active {
  background-color: #ecf5ff;
  color: #409eff;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-count {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 1px 8px;
  border-radius: 10px;
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

.tag-tile {
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 14px;
  padding: 3px 12px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-tile:hover {
  border-color: #409eff;
  color: #409eff;
}

.tag-tile.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.tag-count {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.7;
}

.recent-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.recent-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.recent-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
}

.recent-title {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-link:hover .recent-title {
  color: #409eff;
}

.recent-host {
  font-size: 12px;
  color: #909399;
}

.recent-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.recent-meta .el-tag {
  cursor: pointer;
}

.panel-tip {
  font-size: 13px;
  color: #606266;
  padding: 8px 0;
}

.panel-tip.muted {
  color: #909399;
}
</style>
