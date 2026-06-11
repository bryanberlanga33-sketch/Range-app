import type { Herd } from './types'

const STORAGE_KEY = 'range-app:herds'

export function loadHerds(): Herd[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Herd[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveHerds(herds: Herd[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(herds))
  } catch {
    // Ignore write failures (e.g. storage disabled / quota exceeded).
  }
}
