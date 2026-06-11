export type LivestockType = 'Cattle' | 'Sheep' | 'Goats' | 'Horses'

export interface Herd {
  id: string
  name: string
  type: LivestockType
  headCount: number
  pasture: string
  createdAt: number
}
