<template>
  <div class="min-h-screen p-8 bg-gradient-to-br from-indigo-500 to-purple-600">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Vue Kanban Board</h1>
      <div class="bg-white rounded-xl shadow-2xl p-6">
        <KanbanBoard />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KanbanBoard from './components/KanbanBoard.vue'
</script>