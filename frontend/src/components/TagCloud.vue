<template>
  <div class="tag-cloud" v-if="linksStore.tags.length > 0">
    <el-card>
      <template #header>
        <div class="sidebar-header">
          <h3>标签</h3>
          <el-button v-if="linksStore.selectedTag" text size="small" @click="linksStore.setTag(null)">
            清除
          </el-button>
        </div>
      </template>

      <div class="tags-container">
        <span
          v-for="tag in linksStore.tags"
          :key="tag.tag"
          class="tag-item"
          :class="{ active: linksStore.selectedTag === tag.tag }"
          :style="{ fontSize: getTagSize(tag.count) + 'px' }"
          @click="handleTagClick(tag.tag)"
        >
          {{ tag.tag }}
        </span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useLinksStore } from '../stores/links'

const linksStore = useLinksStore()

function getTagSize(count) {
  const maxCount = Math.max(...linksStore.tags.map((t) => t.count))
  const minCount = Math.min(...linksStore.tags.map((t) => t.count))

  if (maxCount === minCount) return 14

  const ratio = (count - minCount) / (maxCount - minCount)
  return Math.round(12 + ratio * 8) // 12px to 20px
}

function handleTagClick(tag) {
  if (linksStore.selectedTag === tag) {
    linksStore.setTag(null)
  } else {
    linksStore.setTag(tag)
  }
}
</script>

<style scoped>
.tag-cloud {
  margin-bottom: 16px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 15px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  color: #606266;
}

.tag-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.tag-item.active {
  background-color: #409eff;
  color: white;
}
</style>
