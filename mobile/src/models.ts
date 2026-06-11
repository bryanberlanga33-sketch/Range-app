import type { BaseRecord } from './store/useCollection'
import type { DataPoint, LatLng } from './components/map/types'

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
