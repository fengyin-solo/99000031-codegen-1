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
            size="default"
            @change="handleViewModeChange"
          >
            <el-radio-button value="overview">总览</el-radio-button>
            <el-radio-button value="list">列表</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加链接
          </el-button>
        </div>

        <el-alert
          v-if="linksStore.error"
          :title="linksStore.error"
          type="warning"
          show-icon
          :closable="false"
          class="reload-alert"
        >
          <el-button type="primary" size="small" :loading="linksStore.loading" @click="handleReload">
            重新加载
          </el-button>
        </el-alert>

        <!-- 账号下一条链接都没有：上手引导 -->
        <OnboardingGuide
          v-if="!linksStore.loading && !linksStore.error && isAccountEmpty"
          @add-link="showAddDialog"
        />

        <template v-else>
          <!-- 总览看板 -->
          <div v-if="linksStore.viewMode === 'overview'">
            <div v-loading="linksStore.loading">
              <OverviewBoard v-if="hasData" />
              <div v-else class="overview-placeholder"></div>
            </div>
          </div>

          <!-- 链接列表 -->
          <template v-else>
            <div
              class="active-filters"
              v-if="linksStore.selectedCategory || linksStore.selectedTag || linksStore.searchQuery"
            >
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

            <!-- 筛选后没有结果：给出清除入口，而不是一句空话 -->
            <el-empty
              v-if="!linksStore.loading && linksStore.links.length === 0"
              :description="linksStore.hasActiveFilters() ? '当前筛选下没有链接，试试换个条件' : '暂无链接'"
            >
              <el-button v-if="linksStore.hasActiveFilters()" type="primary" @click="linksStore.clearFilters()">
                清除筛选条件
              </el-button>
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
import { ElMessageBox, ElMessage } from 'element-plus'
import { useLinksStore } from '../stores/links'
import CategorySidebar from '../components/CategorySidebar.vue'
import TagCloud from '../components/TagCloud.vue'
import SearchBar from '../components/SearchBar.vue'
import LinkCard from '../components/LinkCard.vue'
import LinkForm from '../components/LinkForm.vue'
import OverviewBoard from '../components/OverviewBoard.vue'
import OnboardingGuide from '../components/OnboardingGuide.vue'

const linksStore = useLinksStore()

const formVisible = ref(false)
const editingLink = ref(null)

const activeCategoryName = computed(() => {
  if (!linksStore.selectedCategory) return null
  const cat = linksStore.categories.find((c) => c.id === linksStore.selectedCategory)
  return cat?.name
})

const isAccountEmpty = computed(
  () => linksStore.accountTotal === 0 && linksStore.recentLinks.length === 0
)
const hasData = computed(
  () => linksStore.recentLinks.length > 0 || linksStore.accountTotal > 0
)

onMounted(() => {
  // Restore this account's persisted selection before fetching, so a refresh
  // lands on the same view/filter/page the user left.
  linksStore.hydrate()
  linksStore.fetchHomeData()
})

function handleViewModeChange(value) {
  linksStore.setViewMode(value)
}

function handleReload() {
  linksStore.fetchHomeData()
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

.reload-alert {
  margin-bottom: 16px;
  align-items: center;
}

.overview-placeholder {
  min-height: 320px;
}

.reload-alert :deep(.el-alert__content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
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
