<template>
  <div class="relative">
    <button
      ref="buttonRef"
      @click="toggleMenu"
      class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
      :aria-label="`Move ${item.name}`"
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
      class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      @click.stop
    >
      <!-- Reorder Section -->
      <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Reorder
      </div>
      <button
        @click="moveToTop"
        :disabled="isMoveUpDisabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Move to top
      </button>
      <button
        @click="moveUp"
        :disabled="isMoveUpDisabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Move up
      </button>
      <button
        @click="moveDown"
        :disabled="isMoveDownDisabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Move down
      </button>
      <button
        @click="moveToBottom"
        :disabled="isMoveDownDisabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Move to bottom
      </button>

      <!-- Move to Column Section -->
      <div v-if="moveColumnOptions.length" class="border-t border-gray-100 mt-1">
        <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Move to
        </div>
        <button
          v-for="column in moveColumnOptions"
          :key="column.columnId"
          @click="moveToColumn(column)"
          class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
        >
          {{ column.title }}
        </button>
      </div>
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
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import type { Person, ColumnType } from '../types'

interface Props {
  item: Person
  columnId: string
  boardContext: any
}

const props = defineProps<Props>()

const buttonRef = ref<HTMLButtonElement>()
const isMenuOpen = ref(false)

// Inject column context
const getCardIndex = inject<(userId: string) => number>('getCardIndex')!
const getNumCards = inject<() => number>('getNumCards')!

const startIndex = computed(() => getCardIndex(props.item.userId))
const numCards = computed(() => getNumCards())

const isMoveUpDisabled = computed(() => startIndex.value === 0)
const isMoveDownDisabled = computed(() => startIndex.value === numCards.value - 1)

const moveColumnOptions = computed(() => {
  return props.boardContext.getColumns().filter(
    (column: ColumnType) => column.columnId !== props.columnId
  )
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const moveToTop = () => {
  props.boardContext.reorderCard({
    columnId: props.columnId,
    startIndex: startIndex.value,
    finishIndex: 0,
  })
  closeMenu()
}

const moveUp = () => {
  props.boardContext.reorderCard({
    columnId: props.columnId,
    startIndex: startIndex.value,
    finishIndex: startIndex.value - 1,
  })
  closeMenu()
}

const moveDown = () => {
  props.boardContext.reorderCard({
    columnId: props.columnId,
    startIndex: startIndex.value,
    finishIndex: startIndex.value + 1,
  })
  closeMenu()
}

const moveToBottom = () => {
  props.boardContext.reorderCard({
    columnId: props.columnId,
    startIndex: startIndex.value,
    finishIndex: numCards.value - 1,
  })
  closeMenu()
}

const moveToColumn = (targetColumn: ColumnType) => {
  props.boardContext.moveCard({
    startColumnId: props.columnId,
    finishColumnId: targetColumn.columnId,
    itemIndexInStartColumn: startIndex.value,
  })
  closeMenu()
}

// Close menu on escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  buttonRef
})
</script>