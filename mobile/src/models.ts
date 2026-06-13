import type { BaseRecord } from './store/useCollection'
import type { DataPoint, LatLng } from './components/map/types'
import type { ForageValue, PlantCategory } from './data/plantCatalog'

export type { LatLng, DataPoint } from './components/map/types'

export interface LocationRecord extends BaseRecord {
  /** Human-given name for the polygon (pasture / property). */
  name: string
  notes: string
  /** Polygon guide vertices that outline the property fence. */
  vertices: LatLng[]
  /** Legacy fields from earlier app versions. */
  points?: { lat: number; lng: number }[]
  coordinates?: string
}

export interface JournalEntry extends BaseRecord {
  title: string
  conditions: string
  /** Selected polygon (location) this entry maps data points within. */
  locationId?: string
  locationName?: string
  dataPoints: DataPoint[]
  /** Optional property photo attached to the entry. */
  photoUri?: string
}

export interface PlantRecord extends BaseRecord {
  speciesId?: string
  commonName: string
  scientificName: string
  category: PlantCategory
  forageValue: ForageValue
  description: string
  imageUrl?: string
  /** Pasture/property polygon where this plant was found. */
  pastureId?: string
  pastureName?: string
}

export type LivestockSpecies = 'Cattle' | 'Sheep' | 'Goats' | 'Horses'

export type AnimalIdType = 'Name' | 'Tag'

export interface Animal {
  id: string
  identifier: string
  idType: AnimalIdType
}

export interface Herd extends BaseRecord {
  name: string
  species: LivestockSpecies
  headCount: number
  /** Pasture/property polygon this herd currently occupies. */
  pastureId?: string
  pastureName?: string
  /** Whether this herd is part of a pasture rotation. */
  onRotation: boolean
  /** Optionally identified individuals (by name or tag). */
  animals: Animal[]
}

export interface WildlifeSighting extends BaseRecord {
  species: string
  count?: string
  pastureId?: string
  pastureName?: string
  /** Where the animal was seen (a point within the polygon). */
  location?: LatLng
  notes?: string
}

/**
 * A named grouping of pasture polygons. Used to plan a rotational grazing
 * sequence (`kind: 'rotation'`, where `pastureIds` order is the rotation order)
 * or simply to group the pastures that make up one property (`kind: 'property'`).
 */
export interface PastureGroup extends BaseRecord {
  name: string
  kind: 'rotation' | 'property'
  /** Member location (pasture) ids. For rotations, order = grazing sequence. */
  pastureIds: string[]
  note?: string
}

/** Resolves a location's polygon vertices, tolerating legacy `points` data. */
export function locationVertices(loc: LocationRecord): LatLng[] {
  if (loc.vertices && loc.vertices.length > 0) {
    return loc.vertices
  }
  if (Array.isArray(loc.points)) {
    return loc.points.map((p) => ({ lat: p.lat, lng: p.lng }))
  }
  return []
}
