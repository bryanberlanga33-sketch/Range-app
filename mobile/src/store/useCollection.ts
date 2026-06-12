import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface BaseRecord {
  id: string
  createdAt: number
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * A small persistent list hook backed by AsyncStorage. Works on iOS, Android,
 * and web. Each collection is keyed by `storageKey`.
 */
export function useCollection<T extends BaseRecord>(storageKey: string) {
  const [items, setItems] = useState<T[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!active) return
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as T[]
            if (Array.isArray(parsed)) setItems(parsed)
          } catch {
            // Ignore malformed data and start fresh.
          }
        }
      })
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [storageKey])

  const persist = useCallback(
    (next: T[]) => {
      setItems(next)
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {
        // Ignore write failures (e.g. storage unavailable).
      })
    },
    [storageKey],
  )

  const add = useCallback(
    (fields: Omit<T, 'id' | 'createdAt'>) => {
      const record = {
        ...fields,
        id: makeId(),
        createdAt: Date.now(),
      } as T
      persist([record, ...items])
    },
    [items, persist],
  )

  const remove = useCallback(
    (id: string) => {
      persist(items.filter((item) => item.id !== id))
    },
    [items, persist],
  )

  const update = useCallback(
    (id: string, patch: Partial<T> | ((item: T) => Partial<T>)) => {
      persist(
        items.map((item) =>
          item.id === id
            ? { ...item, ...(typeof patch === 'function' ? patch(item) : patch) }
            : item,
        ),
      )
    },
    [items, persist],
  )

  return { items, add, remove, update, loaded }
}
