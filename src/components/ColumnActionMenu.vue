<template>
  <div class="relative">
    <button
      @click="toggleMenu"
      class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
      aria-label="Column actions"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="2"/>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="19" cy="12" r="2"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isMenuOpen"
      class="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      @click.stop
    >
      <button
        @click="moveLeft"
        :disabled="isMoveLeftDisabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Move left
      </button>
      <button
        @click="moveRight"
        :disabled="isMoveRightDisabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Move right
      </button>
    </div>
  </div>

  <!-- Click outside overlay -->
  <div
    v-if="isMenuOpen"
    class="fixed inset-0 z-40"
    @click="closeMenu"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'

interface Props {
  columnId: string
}

const props = defineProps<Props>()

const isMenuOpen = ref(false)

// Inject board context (we'll need to pass this down)
const boardContext = inject<any>('boardContext', null)

const columns = computed(() => boardContext?.getColumns() || [])
const startIndex = computed(() => 
  columns.value.findIndex((column: any) => column.columnId === props.columnId)
)

const isMoveLeftDisabled = computed(() => startIndex.value === 0)
const isMoveRightDisabled = computed(() => startIndex.value === columns.value.length - 1)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const moveLeft = () => {
  if (boardContext) {
    boardContext.reorderColumn({
      startIndex: startIndex.value,
      finishIndex: startIndex.value - 1,
    })
  }
  closeMenu()
}

const moveRight = () => {
  if (boardContext) {
    boardContext.reorderColumn({
      startIndex: startIndex.value,
      finishIndex: startIndex.value + 1,
    })
  }
  closeMenu()
}
</script>