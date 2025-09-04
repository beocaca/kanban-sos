<template>
  <div
    ref="columnRef"
    :data-testid="`column-${column.columnId}`"
    class="w-[250px] bg-elevation-surface-sunken rounded-xlarge relative transition-colors duration-300"
    :class="[
      stateClasses,
      isDragging ? 'opacity-40' : 'cursor-grab'
    ]"
  >
    <div ref="columnInnerRef" class="flex flex-col min-h-0 flex-grow">
      <div class="flex flex-col min-h-0 flex-grow" :class="{ 'opacity-40': isDragging }">
        <!-- Column Header -->
        <div
          ref="headerRef"
          :data-testid="`column-header-${column.columnId}`"
          class="flex justify-between items-center px-4 pt-2 text-text-subtlest select-none"
        >
          <h3 
            :data-testid="`column-header-title-${column.columnId}`"
            class="text-sm font-semibold m-0"
          >
            {{ column.title }}
          </h3>
          <ColumnActionMenu :column-id="column.columnId" />
        </div>

        <!-- Scrollable Card Container -->
        <div ref="scrollableRef" class="h-full overflow-y-auto">
          <div class="box-border min-h-full p-2 flex flex-col gap-2">
            <KanbanCard
              v-for="item in column.items"
              :key="item.userId"
              :item="item"
              :column-id="column.columnId"
              :board-context="boardContext"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Drop Indicator for Column Reordering -->
    <DropIndicator
      v-if="state.type === 'is-column-over' && state.closestEdge"
      :edge="state.closestEdge"
    />

    <!-- Safari Preview Portal -->
    <teleport to="body" v-if="state.type === 'generate-safari-column-preview'">
      <div class="w-[250px] bg-elevation-surface-sunken rounded-lg p-4">
        <h3 class="text-sm font-semibold text-text-subtlest">{{ column.title }}</h3>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import invariant from 'tiny-invariant'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import type { ColumnType } from '../types'
import KanbanCard from './KanbanCard.vue'
import ColumnActionMenu from './ColumnActionMenu.vue'
import DropIndicator from './DropIndicator.vue'

interface Props {
  column: ColumnType
  boardContext: any
}

const props = defineProps<Props>()

type State =
  | { type: 'idle' }
  | { type: 'is-card-over' }
  | { type: 'is-column-over'; closestEdge: Edge | null }
  | { type: 'generate-safari-column-preview'; container: HTMLElement }
  | { type: 'generate-column-preview' }

const columnRef = ref<HTMLDivElement>()
const columnInnerRef = ref<HTMLDivElement>()
const headerRef = ref<HTMLDivElement>()
const scrollableRef = ref<HTMLDivElement>()
const state = ref<State>({ type: 'idle' })
const isDragging = ref(false)

const stateClasses = computed(() => {
  switch (state.value.type) {
    case 'is-card-over':
      return 'bg-background-selected-hovered'
    case 'generate-column-preview':
      return 'isolate'
    default:
      return ''
  }
})

// Provide column context
provide('columnId', props.column.columnId)
provide('getCardIndex', (userId: string) => {
  return props.column.items.findIndex((item) => item.userId === userId)
})
provide('getNumCards', () => props.column.items.length)

let cleanup: (() => void) | null = null

onMounted(() => {
  invariant(columnRef.value)
  invariant(columnInnerRef.value)
  invariant(headerRef.value)
  invariant(scrollableRef.value)

  cleanup = combine(
    props.boardContext.registerColumn(props.column.columnId, {
      element: columnRef.value,
    }),
    draggable({
      element: columnRef.value,
      dragHandle: headerRef.value,
      getInitialData: () => ({
        columnId: props.column.columnId,
        type: 'column',
        instanceId: props.boardContext.instanceId,
      }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        const isSafari = navigator.userAgent.includes('AppleWebKit') && 
                         !navigator.userAgent.includes('Chrome')

        if (!isSafari) {
          state.value = { type: 'generate-column-preview' }
          return
        }

        setCustomNativeDragPreview({
          getOffset: centerUnderPointer,
          render: ({ container }) => {
            state.value = {
              type: 'generate-safari-column-preview',
              container,
            }
            return () => (state.value = { type: 'idle' })
          },
          nativeSetDragImage,
        })
      },
      onDragStart: () => {
        isDragging.value = true
      },
      onDrop() {
        state.value = { type: 'idle' }
        isDragging.value = false
      },
    }),
    dropTargetForElements({
      element: columnInnerRef.value,
      getData: () => ({ columnId: props.column.columnId }),
      canDrop: ({ source }) => {
        return (
          source.data.instanceId === props.boardContext.instanceId &&
          source.data.type === 'card'
        )
      },
      getIsSticky: () => true,
      onDragEnter: () => (state.value = { type: 'is-card-over' }),
      onDragLeave: () => (state.value = { type: 'idle' }),
      onDragStart: () => (state.value = { type: 'is-card-over' }),
      onDrop: () => (state.value = { type: 'idle' }),
    }),
    dropTargetForElements({
      element: columnRef.value,
      canDrop: ({ source }) => {
        return (
          source.data.instanceId === props.boardContext.instanceId &&
          source.data.type === 'column'
        )
      },
      getIsSticky: () => true,
      getData: ({ input, element }) => {
        const data = {
          columnId: props.column.columnId,
        }
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ['left', 'right'],
        })
      },
      onDragEnter: (args) => {
        state.value = {
          type: 'is-column-over',
          closestEdge: extractClosestEdge(args.self.data),
        }
      },
      onDrag: (args) => {
        const closestEdge: Edge | null = extractClosestEdge(args.self.data)
        if (
          state.value.type === 'is-column-over' &&
          state.value.closestEdge === closestEdge
        ) {
          return
        }
        state.value = {
          type: 'is-column-over',
          closestEdge,
        }
      },
      onDragLeave: () => {
        state.value = { type: 'idle' }
      },
      onDrop: () => {
        state.value = { type: 'idle' }
      },
    }),
    autoScrollForElements({
      element: scrollableRef.value,
      canScroll: ({ source }) =>
        source.data.instanceId === props.boardContext.instanceId &&
        source.data.type === 'card',
    })
  )
})

onUnmounted(() => {
  cleanup?.()
})
</script>