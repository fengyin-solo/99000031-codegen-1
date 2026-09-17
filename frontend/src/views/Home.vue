<template>
  <div class="home-container">
    <div class="main-layout">
      <aside class="sidebar">
        <CategorySidebar />
        <TagCloud />
      </aside>
      <main class="content">
        <div class="content-header">
          <SearchBar />
          <el-radio-group
            :model-value="linksStore.viewMode"
            class="view-switch"
            @change="handleViewChange"
          >
            <el-radio-button value="overview">收藏总览</el-radio-button>
            <el-radio-button value="list">链接列表</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加链接
          </el-button>
        </div>

        <!-- 取数失败：保留上一次的呈现，并说明可以重新加载 -->
        <el-alert
          v-if="hasLoadError"
          class="load-error"
          type="warning"
          :closable="false"
          show-icon
          title="部分数据加载失败，已保留上次的呈现"
        >
          <div class="load-error-body">
            <span>你仍可以浏览之前加载的内容，网络恢复后请重新加载。</span>
            <el-button type="primary" size="small" :loading="linksStore.loading" @click="handleReload">
              重新加载
            </el-button>
          </div>
        </el-alert>

        <div class="active-filters" v-if="linksStore.selectedCategory || linksStore.selectedTag || linksStore.searchQuery">
          <span class="filter-label">当前筛选:</span>
          <el-tag v-if="linksStore.searchQuery" closable @close="linksStore.clearFilters()">
            搜索: {{ linksStore.searchQuery }}
          </el-tag>
          <el-tag v-if="activeCategoryName" type="success" closable @close="linksStore.setCategory(null)">
            分类: {{ activeCategoryName }}
          </el-tag>
          <el-tag v-if="linksStore.selectedTag" type="warning" closable @close="linksStore.setTag(null)">
            标签: {{ linksStore.selectedTag }}
          </el-tag>
          <el-button type="primary" link @click="linksStore.clearFilters()">清除全部</el-button>
        </div>

        <!-- 一条链接都没有：上手引导 -->
        <EmptyGuide
          v-if="isAccountEmpty"
          @add="showAddDialog"
          @import="router.push('/import')"
        />

        <template v-else>
          <!-- 收藏总览 -->
          <OverviewDashboard v-if="linksStore.viewMode === 'overview'" @reload="handleReload" />

          <!-- 链接列表 -->
          <template v-else>
            <div v-loading="linksStore.loading" class="links-grid">
              <LinkCard
                v-for="link in linksStore.links"
                :key="link.id"
                :link="link"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>

            <div class="pagination" v-if="linksStore.totalPages > 1">
              <el-pagination
                v-model:current-page="linksStore.currentPage"
                :page-size="12"
                :total="linksStore.total"
                layout="prev, pager, next"
                @current-change="handlePageChange"
              />
            </div>

            <!-- 当前筛选下没有结果（账号里其实有链接） -->
            <el-empty
              v-if="!linksStore.loading && linksStore.links.length === 0 && !linksStore.linksError"
              description="没有符合当前筛选的链接"
            >
              <el-button type="primary" @click="linksStore.clearFilters()">清除筛选条件</el-button>
            </el-empty>
          </template>
        </template>
      </main>
    </div>

    <LinkForm
      v-model:visible="formVisible"
      :link="editingLink"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useLinksStore } from '../stores/links'
import CategorySidebar from '../components/CategorySidebar.vue'
import TagCloud from '../components/TagCloud.vue'
import SearchBar from '../components/SearchBar.vue'
import LinkCard from '../components/LinkCard.vue'
import LinkForm from '../components/LinkForm.vue'
import OverviewDashboard from '../components/OverviewDashboard.vue'
import EmptyGuide from '../components/EmptyGuide.vue'

const linksStore = useLinksStore()
const router = useRouter()

const formVisible = ref(false)
const editingLink = ref(null)

const activeCategoryName = computed(() => {
  if (!linksStore.selectedCategory) return null
  const cat = linksStore.categories.find((c) => c.id === linksStore.selectedCategory)
  return cat?.name
})

const hasLoadError = computed(
  () =>
    linksStore.linksError ||
    linksStore.recentError ||
    linksStore.categoriesError ||
    linksStore.tagsError
)

// 账号下一条链接都没有（无筛选的总数为 0，且最近一次取数成功）
const isAccountEmpty = computed(
  () => linksStore.linksEverLoaded && !linksStore.recentError && linksStore.totalCount === 0
)

onMounted(() => {
  linksStore.fetchAll()
})

function handleViewChange(mode) {
  linksStore.setViewMode(mode)
}

function handleReload() {
  linksStore.fetchAll()
}

function showAddDialog() {
  editingLink.value = null
  formVisible.value = true
}

function handleEdit(link) {
  editingLink.value = { ...link }
  formVisible.value = true
}

async function handleDelete(link) {
  try {
    await ElMessageBox.confirm(`确定要删除 "${link.title}" 吗？`, '确认删除', {
      type: 'warning',
    })
    await linksStore.deleteLink(link.id)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function handleSaved() {
  formVisible.value = false
  editingLink.value = null
}

function handlePageChange(page) {
  linksStore.fetchLinks(page)
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.content-header .el-button {
  flex-shrink: 0;
}

.view-switch {
  flex-shrink: 0;
}

.load-error {
  margin-bottom: 16px;
  align-items: center;
}

.load-error-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #606266;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
