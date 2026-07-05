export interface LatLng {
  lat: number
  lng: number
}

/**
 * A Daubenmire frame reading taken at a data point. Cover values are ocular
 * canopy-cover estimates (percent) following the Daubenmire frame method.
 * `dryMatterGrams` is the oven-dry forage clipped from this single 1 m × 1 m
 * (1 m²) frame; frames are summed and averaged, then scaled by the polygon
 * area to estimate the whole pasture's dry matter.
 */
export interface FrameSample {
  forageType?: string
  foragePct?: number
  litterPct?: number
  bareGroundPct?: number
  dryMatterGrams?: number
}

export interface DataPoint {
  id: string
  label: string
  lat: number
  lng: number
  /** Optional Daubenmire frame reading captured at this point. */
  sample?: FrameSample
}
