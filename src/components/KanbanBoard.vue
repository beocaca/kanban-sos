<template>
  <div class="flex justify-center gap-4 h-[480px] w-full">
    <KanbanColumn
      v-for="columnId in data.orderedColumnIds"
      :key="columnId"
      :column="data.columnMap[columnId]"
      :board-context="{
        getColumns,
        reorderColumn,
        reorderCard,
        moveCard,
        registerCard,
        registerColumn,
        instanceId,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, provide } from 'vue'
import { useDragAndDrop } from '../composables/useDragAndDrop'
import KanbanColumn from './KanbanColumn.vue'

const {
  data,
  getColumns,
  reorderColumn,
  reorderCard,
  moveCard,
  registerCard,
  registerColumn,
  instanceId,
  handlePostMoveEffects,
} = useDragAndDrop()

// Provide board context to child components
const boardContext = {
  getColumns,
  reorderColumn,
  reorderCard,
  moveCard,
  registerCard,
  registerColumn,
  instanceId,
}

provide('boardContext', boardContext)

// Watch for operations and handle post-move effects
watch(
  () => data.value.lastOperation,
  (operation) => {
    if (operation) {
      handlePostMoveEffects(operation)
    }
  }
)
</script>