import { ref, computed, onMounted, onUnmounted } from 'vue'
import invariant from 'tiny-invariant'
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import type { BoardState, Outcome, Trigger, Operation } from '../types'
import { getBasicData } from '../data/people'
import { useRegistry } from './useRegistry'

export function useDragAndDrop() {
  const data = ref<BoardState>({
    const base = getBasicData()
    return {
      ...base,
      lastOperation: null,
    }
  })

  const registry = useRegistry()
  const instanceId = ref(Symbol('instance-id'))

  const getColumns = () => {
    const { columnMap, orderedColumnIds } = data.value
    return orderedColumnIds.map((columnId) => columnMap[columnId])
  }

  const reorderColumn = ({
    startIndex,
    finishIndex,
    trigger = 'keyboard',
  }: {
    startIndex: number
    finishIndex: number
    trigger?: Trigger
  }) => {
    const outcome: Outcome = {
      type: 'column-reorder',
      columnId: data.value.orderedColumnIds[startIndex],
      startIndex,
      finishIndex,
    }

    data.value = {
      ...data.value,
      orderedColumnIds: reorder({
        list: data.value.orderedColumnIds,
        startIndex,
        finishIndex,
      }),
      lastOperation: {
        outcome,
        trigger,
      },
    }
  }

  const reorderCard = ({
    columnId,
    startIndex,
    finishIndex,
    trigger = 'keyboard',
  }: {
    columnId: string
    startIndex: number
    finishIndex: number
    trigger?: Trigger
  }) => {
    const sourceColumn = data.value.columnMap[columnId]
    const updatedItems = reorder({
      list: sourceColumn.items,
      startIndex,
      finishIndex,
    })

    const updatedSourceColumn = {
      ...sourceColumn,
      items: updatedItems,
    }

    const updatedMap = {
      ...data.value.columnMap,
      [columnId]: updatedSourceColumn,
    }

    const outcome: Outcome = {
      type: 'card-reorder',
      columnId,
      startIndex,
      finishIndex,
    }

    data.value = {
      ...data.value,
      columnMap: updatedMap,
      lastOperation: {
        trigger,
        outcome,
      },
    }
  }

  const moveCard = ({
    startColumnId,
    finishColumnId,
    itemIndexInStartColumn,
    itemIndexInFinishColumn,
    trigger = 'keyboard',
  }: {
    startColumnId: string
    finishColumnId: string
    itemIndexInStartColumn: number
    itemIndexInFinishColumn?: number
    trigger?: Trigger
  }) => {
    if (startColumnId === finishColumnId) {
      return
    }

    const sourceColumn = data.value.columnMap[startColumnId]
    const destinationColumn = data.value.columnMap[finishColumnId]
    const item = sourceColumn.items[itemIndexInStartColumn]

    const destinationItems = Array.from(destinationColumn.items)
    const newIndexInDestination = itemIndexInFinishColumn ?? 0
    destinationItems.splice(newIndexInDestination, 0, item)

    const updatedMap = {
      ...data.value.columnMap,
      [startColumnId]: {
        ...sourceColumn,
        items: sourceColumn.items.filter((i) => i.userId !== item.userId),
      },
      [finishColumnId]: {
        ...destinationColumn,
        items: destinationItems,
      },
    }

    const outcome: Outcome = {
      type: 'card-move',
      finishColumnId,
      itemIndexInStartColumn,
      itemIndexInFinishColumn: newIndexInDestination,
    }

    data.value = {
      ...data.value,
      columnMap: updatedMap,
      lastOperation: {
        outcome,
        trigger,
      },
    }
  }

  // Handle post-move effects
  const handlePostMoveEffects = (operation: Operation) => {
    const { outcome, trigger } = operation

    if (outcome.type === 'column-reorder') {
      const { startIndex, finishIndex } = outcome
      const { columnMap, orderedColumnIds } = data.value
      const sourceColumn = columnMap[orderedColumnIds[finishIndex]]

      const entry = registry.getColumn(sourceColumn.columnId)
      triggerPostMoveFlash(entry.element)

      liveRegion.announce(
        `You've moved ${sourceColumn.title} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${orderedColumnIds.length}.`
      )
      return
    }

    if (outcome.type === 'card-reorder') {
      const { columnId, startIndex, finishIndex } = outcome
      const { columnMap } = data.value
      const column = columnMap[columnId]
      const item = column.items[finishIndex]

      const entry = registry.getCard(item.userId)
      triggerPostMoveFlash(entry.element)

      if (trigger !== 'keyboard') {
        return
      }

      liveRegion.announce(
        `You've moved ${item.name} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${column.items.length} in the ${column.title} column.`
      )
      return
    }

    if (outcome.type === 'card-move') {
      const { finishColumnId, itemIndexInStartColumn, itemIndexInFinishColumn } = outcome
      const destinationColumn = data.value.columnMap[finishColumnId]
      const item = destinationColumn.items[itemIndexInFinishColumn]

      const finishPosition =
        typeof itemIndexInFinishColumn === 'number'
          ? itemIndexInFinishColumn + 1
          : destinationColumn.items.length

      const entry = registry.getCard(item.userId)
      triggerPostMoveFlash(entry.element)

      if (trigger !== 'keyboard') {
        return
      }

      liveRegion.announce(
        `You've moved ${item.name} from position ${
          itemIndexInStartColumn + 1
        } to position ${finishPosition} in the ${destinationColumn.title} column.`
      )

      entry.actionMenuTrigger.focus()
      return
    }
  }

  let cleanup: (() => void) | null = null

  onMounted(() => {
    cleanup = combine(
      monitorForElements({
        canMonitor({ source }) {
          return source.data.instanceId === instanceId.value
        },
        onDrop(args) {
          const { location, source } = args
          if (!location.current.dropTargets.length) {
            return
          }

          if (source.data.type === 'column') {
            const startIndex = data.value.orderedColumnIds.findIndex(
              (columnId) => columnId === source.data.columnId
            )

            const target = location.current.dropTargets[0]
            const indexOfTarget = data.value.orderedColumnIds.findIndex(
              (id) => id === target.data.columnId
            )
            const closestEdgeOfTarget: Edge | null = extractClosestEdge(target.data)

            const finishIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: 'horizontal',
            })

            reorderColumn({ startIndex, finishIndex, trigger: 'pointer' })
          }

          if (source.data.type === 'card') {
            const itemId = source.data.itemId
            invariant(typeof itemId === 'string')
            
            const [, startColumnRecord] = location.initial.dropTargets
            const sourceId = startColumnRecord.data.columnId
            invariant(typeof sourceId === 'string')
            const sourceColumn = data.value.columnMap[sourceId]
            const itemIndex = sourceColumn.items.findIndex((item) => item.userId === itemId)

            if (location.current.dropTargets.length === 1) {
              const [destinationColumnRecord] = location.current.dropTargets
              const destinationId = destinationColumnRecord.data.columnId
              invariant(typeof destinationId === 'string')
              const destinationColumn = data.value.columnMap[destinationId]
              invariant(destinationColumn)

              if (sourceColumn === destinationColumn) {
                const destinationIndex = getReorderDestinationIndex({
                  startIndex: itemIndex,
                  indexOfTarget: sourceColumn.items.length - 1,
                  closestEdgeOfTarget: null,
                  axis: 'vertical',
                })
                reorderCard({
                  columnId: sourceColumn.columnId,
                  startIndex: itemIndex,
                  finishIndex: destinationIndex,
                  trigger: 'pointer',
                })
                return
              }

              moveCard({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
                trigger: 'pointer',
              })
              return
            }

            if (location.current.dropTargets.length === 2) {
              const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets
              const destinationColumnId = destinationColumnRecord.data.columnId
              invariant(typeof destinationColumnId === 'string')
              const destinationColumn = data.value.columnMap[destinationColumnId]

              const indexOfTarget = destinationColumn.items.findIndex(
                (item) => item.userId === destinationCardRecord.data.itemId
              )
              const closestEdgeOfTarget: Edge | null = extractClosestEdge(
                destinationCardRecord.data
              )

              if (sourceColumn === destinationColumn) {
                const destinationIndex = getReorderDestinationIndex({
                  startIndex: itemIndex,
                  indexOfTarget,
                  closestEdgeOfTarget,
                  axis: 'vertical',
                })
                reorderCard({
                  columnId: sourceColumn.columnId,
                  startIndex: itemIndex,
                  finishIndex: destinationIndex,
                  trigger: 'pointer',
                })
                return
              }

              const destinationIndex =
                closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget

              moveCard({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
                itemIndexInFinishColumn: destinationIndex,
                trigger: 'pointer',
              })
            }
          }
        },
      })
    )
  })

  onUnmounted(() => {
    cleanup?.()
    liveRegion.cleanup()
  })

  return {
    data: computed(() => data.value),
    getColumns,
    reorderColumn,
    reorderCard,
    moveCard,
    registerCard: registry.registerCard,
    registerColumn: registry.registerColumn,
    instanceId: computed(() => instanceId.value),
    handlePostMoveEffects,
  }
}