export interface GeoPoint {
  id: string
  name: string
  lat: number
  lng: number
}

export interface MapFenceProps {
  points: GeoPoint[]
  onChange: (points: GeoPoint[]) => void
}
