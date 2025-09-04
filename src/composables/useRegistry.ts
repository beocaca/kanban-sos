import { ref } from 'vue'
import invariant from 'tiny-invariant'
import type { CardEntry, ColumnEntry } from '../types'

export function useRegistry() {
  const cards = ref(new Map<string, CardEntry>())
  const columns = ref(new Map<string, ColumnEntry>())

  function registerCard(cardId: string, entry: CardEntry) {
    cards.value.set(cardId, entry)
    return function cleanup() {
      cards.value.delete(cardId)
    }
  }

  function registerColumn(columnId: string, entry: ColumnEntry) {
    columns.value.set(columnId, entry)
    return function cleanup() {
      columns.value.delete(columnId)
    }
  }

  function getCard(cardId: string): CardEntry {
    const entry = cards.value.get(cardId)
    invariant(entry)
    return entry
  }

  function getColumn(columnId: string): ColumnEntry {
    const entry = columns.value.get(columnId)
    invariant(entry)
    return entry
  }

  return {
    registerCard,
    registerColumn,
    getCard,
    getColumn
  }
}