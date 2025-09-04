<template>
  <div
    class="absolute pointer-events-none z-10"
    :class="indicatorClasses"
    :style="indicatorStyles"
  >
    <div class="bg-blue-500 rounded-sm" :style="lineStyles"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'

interface Props {
  edge: Edge
  gap?: string
}

const props = withDefaults(defineProps<Props>(), {
  gap: '8px'
})

const indicatorClasses = computed(() => {
  switch (props.edge) {
    case 'top':
      return 'top-0 left-0 right-0 -translate-y-1/2'
    case 'bottom':
      return 'bottom-0 left-0 right-0 translate-y-1/2'
    case 'left':
      return 'left-0 top-0 bottom-0 -translate-x-1/2'
    case 'right':
      return 'right-0 top-0 bottom-0 translate-x-1/2'
    default:
      return ''
  }
})

const indicatorStyles = computed(() => {
  const gap = props.gap
  
  switch (props.edge) {
    case 'top':
    case 'bottom':
      return {
        paddingLeft: gap,
        paddingRight: gap,
      }
    case 'left':
    case 'right':
      return {
        paddingTop: gap,
        paddingBottom: gap,
      }
    default:
      return {}
  }
})

const lineStyles = computed(() => {
  switch (props.edge) {
    case 'top':
    case 'bottom':
      return {
        height: '2px',
        width: '100%',
      }
    case 'left':
    case 'right':
      return {
        width: '2px',
        height: '100%',
      }
    default:
      return {}
  }
})
</script>