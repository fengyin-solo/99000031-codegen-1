<template>
  <div class="search-bar">
    <el-input
      v-model="searchText"
      placeholder="搜索链接..."
      prefix-icon="Search"
      clearable
      @keyup.enter="handleSearch"
      @clear="handleClear"
    >
      <template #append>
        <el-button @click="handleSearch">搜索</el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLinksStore } from '../stores/links'

const linksStore = useLinksStore()

// Bind directly to the shared selection so restoring from storage (refresh /
// switching back from the board) keeps the input in sync as well.
const searchText = computed({
  get: () => linksStore.searchQuery,
  set: (value) => {
    linksStore.searchQuery = value
  },
})

function handleSearch() {
  linksStore.setSearch(searchText.value)
}

function handleClear() {
  linksStore.setSearch('')
}
</script>

<style scoped>
.search-bar {
  flex: 1;
}
</style>
