import { useCallback } from 'react'
import type { GeoPoint } from './types'

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Centralizes mutations of a fence's point list so the web and native MapFence
 * implementations stay in sync.
 */
export function useFence(
  points: GeoPoint[],
  onChange: (points: GeoPoint[]) => void,
) {
  const addPoint = useCallback(
    (lat: number, lng: number) => {
      const point: GeoPoint = {
        id: makeId(),
        name: `Point ${points.length + 1}`,
        lat,
        lng,
      }
      onChange([...points, point])
    },
    [points, onChange],
  )

  const renamePoint = useCallback(
    (id: string, name: string) => {
      onChange(points.map((p) => (p.id === id ? { ...p, name } : p)))
    },
    [points, onChange],
  )

  const removePoint = useCallback(
    (id: string) => {
      onChange(points.filter((p) => p.id !== id))
    },
    [points, onChange],
  )

  const clear = useCallback(() => {
    onChange([])
  }, [onChange])

  return { addPoint, renamePoint, removePoint, clear }
}
