import type { LatLng } from './types'

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Ray-casting point-in-polygon test. Longitude is treated as x and latitude as
 * y. Returns true when the given coordinate lies inside the polygon.
 */
export function pointInPolygon(lat: number, lng: number, polygon: LatLng[]): boolean {
  if (polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Approximate area of a lat/lng polygon in acres. Vertices are projected to a
 * local equirectangular plane (meters) around the polygon's mean latitude and
 * measured with the shoelace formula — accurate enough for pasture-scale areas.
 */
export function polygonAreaAcres(polygon: LatLng[]): number {
  if (polygon.length < 3) return 0
  const lat0 = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length
  const cosLat = Math.cos((lat0 * Math.PI) / 180)
  const xy = polygon.map((p) => ({
    x: p.lng * 111320 * cosLat,
    y: p.lat * 110540,
  }))
  let area = 0
  for (let i = 0, j = xy.length - 1; i < xy.length; j = i++) {
    area += xy[j].x * xy[i].y - xy[i].x * xy[j].y
  }
  const squareMeters = Math.abs(area) / 2
  return squareMeters / 4046.8564224
}
