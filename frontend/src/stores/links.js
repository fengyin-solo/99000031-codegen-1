import { defineStore } from 'pinia'
import { ref } from 'vue'
import { linksApi, categoriesApi, tagsApi } from '../api'

const STORAGE_PREFIX = 'links-state'

function storageKey() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.id ? `${STORAGE_PREFIX}-${user.id}` : null
  } catch {
    return null
  }
}

export const useLinksStore = defineStore('links', () => {
  const links = ref([])
  const recentLinks = ref([])
  const categories = ref([])
  const tags = ref([])
  const total = ref(0)
  const totalCount = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)

  // 最近一次成功取数后记录的「账号下是否完全没有链接」，用于区分空账号与筛选无结果
  const linksEverLoaded = ref(false)

  // 各数据源的错误标记：取数失败时保留上一次的呈现
  const linksError = ref(false)
  const recentError = ref(false)
  const categoriesError = ref(false)
  const tagsError = ref(false)

  // Filters
  const selectedCategory = ref(null)
  const selectedTag = ref(null)
  const searchQuery = ref('')

  // 首页展示方式：overview（收藏总览）/ list（链接列表）
  const viewMode = ref('overview')

  // 刷新后仍停留在刚才的选择上（按账号隔离）
  function restoreState() {
    const key = storageKey()
    if (!key) return
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null')
      if (!saved) return
      selectedCategory.value = saved.selectedCategory ?? null
      selectedTag.value = saved.selectedTag ?? null
      searchQuery.value = saved.searchQuery ?? ''
      viewMode.value = saved.viewMode === 'list' ? 'list' : 'overview'
      currentPage.value = Number(saved.currentPage) > 0 ? Number(saved.currentPage) : 1
    } catch {
      // 损坏的缓存直接忽略
    }
  }

  function persistState() {
    const key = storageKey()
    if (!key) return
    localStorage.setItem(
      key,
      JSON.stringify({
        selectedCategory: selectedCategory.value,
        selectedTag: selectedTag.value,
        searchQuery: searchQuery.value,
        viewMode: viewMode.value,
        currentPage: currentPage.value,
      })
    )
  }

  restoreState()

  async function fetchLinks(page = currentPage.value) {
    loading.value = true
    linksError.value = false
    try {
      const params = {
        page,
        limit: 12,
      }
      if (selectedCategory.value) params.category = selectedCategory.value
      if (selectedTag.value) params.tag = selectedTag.value
      if (searchQuery.value) params.search = searchQuery.value

      const response = await linksApi.getLinks(params)
      // 成功后才覆盖，失败时保留上一次的呈现
      links.value = response.data.links
      total.value = response.data.total
      currentPage.value = response.data.page
      totalPages.value = response.data.totalPages
      linksEverLoaded.value = true
      persistState()
    } catch (error) {
      console.error('Failed to fetch links:', error)
      linksError.value = true
    } finally {
      loading.value = false
    }
  }

  // 总览中的「最近收进来」：不受当前筛选影响，单独保存，失败时保留上一次的数据
  // 同时记录账号下的链接总数（无筛选），用于判断空账号
  async function fetchRecentLinks(limit = 6) {
    recentError.value = false
    try {
      const response = await linksApi.getLinks({ page: 1, limit })
      recentLinks.value = response.data.links
      totalCount.value = response.data.total
      linksEverLoaded.value = true
    } catch (error) {
      console.error('Failed to fetch recent links:', error)
      recentError.value = true
    }
  }

  async function fetchCategories() {
    categoriesError.value = false
    try {
      const response = await categoriesApi.getCategories()
      categories.value = response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      categoriesError.value = true
    }
  }

  async function fetchTags() {
    tagsError.value = false
    try {
      const response = await tagsApi.getTags()
      tags.value = response.data
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      tagsError.value = true
    }
  }

  // 首页初次进入 / 失败后重新加载使用
  async function fetchAll() {
    await Promise.all([
      fetchLinks(currentPage.value),
      fetchRecentLinks(),
      fetchCategories(),
      fetchTags(),
    ])
  }

  async function createLink(data) {
    const response = await linksApi.createLink(data)
    await Promise.all([
      fetchLinks(currentPage.value),
      fetchRecentLinks(),
      fetchCategories(),
      fetchTags(),
    ])
    return response.data
  }

  async function updateLink(id, data) {
    const response = await linksApi.updateLink(id, data)
    await Promise.all([
      fetchLinks(currentPage.value),
      fetchRecentLinks(),
      fetchCategories(),
      fetchTags(),
    ])
    return response.data
  }

  async function deleteLink(id) {
    await linksApi.deleteLink(id)
    await Promise.all([
      fetchLinks(currentPage.value),
      fetchRecentLinks(),
      fetchCategories(),
      fetchTags(),
    ])
  }

  async function createCategory(data) {
    const response = await categoriesApi.createCategory(data)
    await fetchCategories()
    return response.data
  }

  async function updateCategory(id, data) {
    const response = await categoriesApi.updateCategory(id, data)
    await fetchCategories()
    return response.data
  }

  async function deleteCategory(id) {
    await categoriesApi.deleteCategory(id)
    if (selectedCategory.value === id) {
      selectedCategory.value = null
    }
    await Promise.all([fetchCategories(), fetchLinks(currentPage.value)])
  }

  // 应用某个筛选 → 进入列表看那一批链接；手动切换总览/列表不走这里，选择保持不变
  function setCategory(categoryId) {
    selectedCategory.value = categoryId
    selectedTag.value = null
    viewMode.value = 'list'
    persistState()
    fetchLinks(1)
  }

  function setTag(tag) {
    selectedTag.value = tag
    selectedCategory.value = null
    viewMode.value = 'list'
    persistState()
    fetchLinks(1)
  }

  function setSearch(query) {
    searchQuery.value = query
    viewMode.value = 'list'
    persistState()
    fetchLinks(1)
  }

  function clearFilters() {
    selectedCategory.value = null
    selectedTag.value = null
    searchQuery.value = ''
    persistState()
    fetchLinks(1)
  }

  function setViewMode(mode) {
    viewMode.value = mode === 'list' ? 'list' : 'overview'
    persistState()
  }

  // 从总览某一块进入列表：复用同一套选择
  function showList() {
    setViewMode('list')
  }

  return {
    links,
    recentLinks,
    categories,
    tags,
    total,
    totalCount,
    currentPage,
    totalPages,
    loading,
    linksEverLoaded,
    linksError,
    recentError,
    categoriesError,
    tagsError,
    selectedCategory,
    selectedTag,
    searchQuery,
    viewMode,
    fetchLinks,
    fetchRecentLinks,
    fetchCategories,
    fetchTags,
    fetchAll,
    createLink,
    updateLink,
    deleteLink,
    createCategory,
    updateCategory,
    deleteCategory,
    setCategory,
    setTag,
    setSearch,
    clearFilters,
    setViewMode,
    showList,
  }
})
