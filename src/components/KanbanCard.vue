<template>
  <div
    ref="cardRef"
    :data-testid="`item-${item.userId}`"
    class="w-full p-2 bg-elevation-surface rounded-large relative grid grid-cols-[auto_1fr_auto] gap-2 items-center transition-all duration-200"
    :class="[
      stateClasses,
      state.type === 'dragging' ? 'opacity-40' : 'cursor-grab hover:bg-elevation-surface-hovered'
    ]"
  >
    <!-- Avatar -->
    <div class="pointer-events-none">
      <img
        :src="item.avatarUrl"
        :alt="item.name"
        class="w-10 h-10 rounded-full"
      />
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-1 flex-grow min-w-0">
      <h4 class="text-sm font-semibold m-0 truncate">{{ item.name }}</h4>
      <small class="text-xs text-gray-600 m-0">{{ item.role }}</small>
    </div>

    <!-- Action Menu -->
    <div class="self-start">
      <CardActionMenu 
        :item="item" 
        :column-id="columnId"
        :board-context="boardContext"
        ref="actionMenuRef"
      />
    </div>

    <!-- Drop Indicator -->
    <DropIndicator
      v-if="closestEdge"
      :edge="closestEdge"
    />

    <!-- Drag Preview Portal -->
    <teleport to="body" v-if="state.type === 'preview'">
      <div
        class="pointer-events-none"
        :style="{
          width: state.rect.width + 'px',
          height: state.rect.height + 'px',
          boxSizing: 'border-box'
        }"
      >
        <div class="w-full p-2 bg-elevation-surface rounded-large grid grid-cols-[auto_1fr_auto] gap-2 items-center shadow-raised">
          <div class="pointer-events-none">
            <img
              :src="item.avatarUrl"
              :alt="item.name"
              class="w-10 h-10 rounded-full"
            />
          </div>
          <div class="flex flex-col gap-1 flex-grow min-w-0">
            <h4 class="text-sm font-semibold m-0 truncate">{{ item.name }}</h4>
            <small class="text-xs text-gray-600 m-0">{{ item.role }}</small>
          </div>
          <div class="self-start w-8 h-8"></div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import invariant from 'tiny-invariant'
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
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter'
import type { Person } from '../types'
import CardActionMenu from './CardActionMenu.vue'
import DropIndicator from './DropIndicator.vue'

interface Props {
  item: Person
  columnId: string
  boardContext: any
}

const props = defineProps<Props>()

type State =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement; rect: DOMRect }
  | { type: 'dragging' }

const cardRef = ref<HTMLDivElement>()
const actionMenuRef = ref<InstanceType<typeof CardActionMenu>>()
const closestEdge = ref<Edge | null>(null)
const state = ref<State>({ type: 'idle' })

const stateClasses = computed(() => {
  switch (state.value.type) {
    case 'idle':
      return 'shadow-raised'
    case 'dragging':
      return 'shadow-raised'
    case 'preview':
      return ''
    default:
      return 'shadow-raised'
  }
})

let cleanup: (() => void) | null = null

onMounted(() => {
  invariant(cardRef.value)
  invariant(actionMenuRef.value?.buttonRef)

  // Register card with board context
  const cardCleanup = props.boardContext.registerCard(props.item.userId, {
    element: cardRef.value,
    actionMenuTrigger: actionMenuRef.value.buttonRef,
  })

  cleanup = combine(
    cardCleanup,
    draggable({
      element: cardRef.value,
      getInitialData: () => ({
        type: 'card',
        itemId: props.item.userId,
        instanceId: props.boardContext.instanceId,
      }),
      onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
        const rect = source.element.getBoundingClientRect()

        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: preserveOffsetOnSource({
            element: cardRef.value!,
            input: location.current.input,
          }),
          render({ container }) {
            state.value = { type: 'preview', container, rect }
            return () => (state.value = { type: 'dragging' })
          },
        })
      },
      onDragStart: () => (state.value = { type: 'dragging' }),
      onDrop: () => (state.value = { type: 'idle' }),
    }),
    dropTargetForExternal({
      element: cardRef.value,
    }),
    dropTargetForElements({
      element: cardRef.value,
      canDrop: ({ source }) => {
        return (
          source.data.instanceId === props.boardContext.instanceId &&
          source.data.type === 'card'
        )
      },
      getIsSticky: () => true,
      getData: ({ input, element }) => {
        const data = { type: 'card', itemId: props.item.userId }
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ['top', 'bottom'],
        })
      },
      onDragEnter: (args) => {
        if (args.source.data.itemId !== props.item.userId) {
          const edge = extractClosestEdge(args.self.data)
          closestEdge.value = edge
        }
      },
      onDrag: (args) => {
        if (args.source.data.itemId !== props.item.userId) {
          // Only show indicator if this is the primary (first) drop target
          const isFirstTarget = args.location.current.dropTargets[0]?.data.itemId === props.item.userId
          if (isFirstTarget) {
            closestEdge.value = extractClosestEdge(args.self.data)
          } else {
            closestEdge.value = null
          }
        }
      },
      onDragLeave: () => {
        closestEdge.value = null
      },
      onDrop: () => {
        closestEdge.value = null
      },
    })
  )
})

onUnmounted(() => {
  cleanup?.()
})
</script>