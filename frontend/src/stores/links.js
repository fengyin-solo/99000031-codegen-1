import { defineStore } from 'pinia'
import { ref } from 'vue'
import { linksApi, categoriesApi, tagsApi } from '../api'

const STORAGE_PREFIX = 'link-collector:home:'
const DEFAULT_PAGE_SIZE = 12
const RECENT_LIMIT = 6

// Persisted state is scoped per account so switching users never leaks selection.
function getStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return `${STORAGE_PREFIX}${user?.id ?? 'anonymous'}`
  } catch {
    return `${STORAGE_PREFIX}anonymous`
  }
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export const useLinksStore = defineStore('links', () => {
  const persisted = loadPersistedState()

  const links = ref([])
  const categories = ref([])
  const tags = ref([])
  const recentLinks = ref([])
  const accountTotal = ref(0)
  const total = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const error = ref(null)

  // View mode + shared selection (used by both the overview board and the list)
  const viewMode = ref(persisted?.viewMode === 'list' ? 'list' : 'overview')

  // Filters
  const selectedCategory = ref(persisted?.selectedCategory ?? null)
  const selectedTag = ref(persisted?.selectedTag ?? null)
  const searchQuery = ref(persisted?.searchQuery ?? '')
  currentPage.value = Number.isInteger(persisted?.currentPage) ? persisted.currentPage : 1

  let pendingSave = null
  function persist() {
    const snapshot = {
      viewMode: viewMode.value,
      selectedCategory: selectedCategory.value,
      selectedTag: selectedTag.value,
      searchQuery: searchQuery.value,
      currentPage: currentPage.value,
    }
    pendingSave = snapshot
    // Defer writes so rapid selection changes don't spam localStorage.
    queueMicrotask(() => {
      if (pendingSave === snapshot) {
        localStorage.setItem(getStorageKey(), JSON.stringify(snapshot))
        pendingSave = null
      }
    })
  }

  // Called on Home mount: makes the per-account persisted selection effective,
  // including the logout/login-with-refresh case.
  function hydrate() {
    const state = loadPersistedState()
    viewMode.value = state?.viewMode === 'list' ? 'list' : 'overview'
    selectedCategory.value = state?.selectedCategory ?? null
    selectedTag.value = state?.selectedTag ?? null
    searchQuery.value = state?.searchQuery ?? ''
    currentPage.value = Number.isInteger(state?.currentPage) ? state.currentPage : 1
  }

  async function fetchLinks(page = currentPage.value, { manageLoading = true } = {}) {
    if (manageLoading) {
      loading.value = true
      error.value = null
    }
    try {
      const params = {
        page,
        limit: DEFAULT_PAGE_SIZE,
      }
      if (selectedCategory.value) params.category = selectedCategory.value
      if (selectedTag.value) params.tag = selectedTag.value
      if (searchQuery.value) params.search = searchQuery.value

      const response = await linksApi.getLinks(params)
      // Only overwrite on success so a failed reload keeps the last view.
      links.value = response.data.links
      total.value = response.data.total
      currentPage.value = response.data.page
      totalPages.value = response.data.totalPages
    } catch (fetchError) {
      console.error('Failed to fetch links:', fetchError)
      error.value = '链接加载失败，可以重新加载试试'
      throw fetchError
    } finally {
      if (manageLoading) {
        loading.value = false
      }
    }
  }

  // The recent batch is always fetched without any active filter, so the
  // overview board reflects the whole account.
  async function fetchRecentLinks() {
    try {
      const response = await linksApi.getLinks({ page: 1, limit: RECENT_LIMIT })
      recentLinks.value = response.data.links
      accountTotal.value = response.data.total
    } catch (fetchError) {
      console.error('Failed to fetch recent links:', fetchError)
      throw fetchError
    }
  }

  async function fetchCategories() {
    try {
      const response = await categoriesApi.getCategories()
      categories.value = response.data
    } catch (fetchError) {
      console.error('Failed to fetch categories:', fetchError)
      throw fetchError
    }
  }

  async function fetchTags() {
    try {
      const response = await tagsApi.getTags()
      tags.value = response.data
    } catch (fetchError) {
      console.error('Failed to fetch tags:', fetchError)
      throw fetchError
    }
  }

  // Single entry point for first load and manual reload: every dataset is
  // refreshed together, and stale data stays on screen if any request fails.
  async function fetchHomeData() {
    loading.value = true
    error.value = null
    const results = await Promise.allSettled([
      fetchLinks(currentPage.value, { manageLoading: false }),
      fetchRecentLinks(),
      fetchCategories(),
      fetchTags(),
    ])
    loading.value = false
    if (results.some((r) => r.status === 'rejected')) {
      error.value = '数据加载失败，已保留上次的内容，可以重新加载试试'
    }
  }

  async function refreshAll() {
    const results = await Promise.allSettled([
      fetchLinks(currentPage.value, { manageLoading: false }),
      fetchRecentLinks(),
      fetchCategories(),
      fetchTags(),
    ])
    if (results.every((r) => r.status === 'fulfilled')) {
      error.value = null
    }
  }

  async function createLink(data) {
    const response = await linksApi.createLink(data)
    await refreshAll()
    return response.data
  }

  async function updateLink(id, data) {
    const response = await linksApi.updateLink(id, data)
    await refreshAll()
    return response.data
  }

  async function deleteLink(id) {
    await linksApi.deleteLink(id)
    await refreshAll()
  }

  async function createCategory(data) {
    const response = await categoriesApi.createCategory(data)
    await fetchCategories().catch(() => undefined)
    return response.data
  }

  async function updateCategory(id, data) {
    const response = await categoriesApi.updateCategory(id, data)
    await fetchCategories().catch(() => undefined)
    return response.data
  }

  async function deleteCategory(id) {
    await categoriesApi.deleteCategory(id)
    if (selectedCategory.value === id) {
      selectedCategory.value = null
    }
    persist()
    await refreshAll()
  }

  function setViewMode(mode) {
    if (mode !== 'overview' && mode !== 'list') return
    viewMode.value = mode
    persist()
  }

  // Selecting a board tile (or the sidebar/tag cloud) always lands on the list.
  function setCategory(categoryId) {
    selectedCategory.value = categoryId
    selectedTag.value = null
    currentPage.value = 1
    viewMode.value = 'list'
    persist()
    fetchLinks(1)
  }

  function setTag(tag) {
    selectedTag.value = tag
    selectedCategory.value = null
    currentPage.value = 1
    viewMode.value = 'list'
    persist()
    fetchLinks(1)
  }

  function setSearch(query) {
    searchQuery.value = query
    currentPage.value = 1
    viewMode.value = 'list'
    persist()
    fetchLinks(1)
  }

  function clearFilters() {
    selectedCategory.value = null
    selectedTag.value = null
    searchQuery.value = ''
    currentPage.value = 1
    persist()
    fetchLinks(1)
  }

  function hasActiveFilters() {
    return Boolean(selectedCategory.value || selectedTag.value || searchQuery.value)
  }

  return {
    links,
    categories,
    tags,
    recentLinks,
    accountTotal,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    viewMode,
    selectedCategory,
    selectedTag,
    searchQuery,
    hydrate,
    fetchLinks,
    fetchRecentLinks,
    fetchCategories,
    fetchTags,
    fetchHomeData,
    createLink,
    updateLink,
    deleteLink,
    createCategory,
    updateCategory,
    deleteCategory,
    setViewMode,
    setCategory,
    setTag,
    setSearch,
    clearFilters,
    hasActiveFilters,
  }
})
