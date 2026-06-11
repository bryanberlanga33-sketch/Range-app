import type { ForageValue, PlantCategory } from '@/data/plantCatalog'

interface BadgeColors {
  color: string
  background: string
}

const CATEGORY_COLORS: Record<PlantCategory, BadgeColors> = {
  Grass: { color: '#3f5a26', background: '#e3eecf' },
  Forb: { color: '#6b4a7a', background: '#efe3f3' },
  Brush: { color: '#6f5a2e', background: '#ece2cf' },
}

const FORAGE_COLORS: Record<ForageValue, BadgeColors> = {
  Bad: { color: '#9b3b28', background: '#f6dcd5' },
  Fair: { color: '#8a6d1f', background: '#f5ecd2' },
  Good: { color: '#3f5a26', background: '#e3eecf' },
  Great: { color: '#2f4a18', background: '#cfe3ba' },
}

export function categoryBadge(category: PlantCategory): BadgeColors {
  return CATEGORY_COLORS[category]
}

export function forageBadge(value: ForageValue): BadgeColors {
  return FORAGE_COLORS[value]
}
