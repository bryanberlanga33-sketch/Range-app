export interface LatLng {
  lat: number
  lng: number
}

/**
 * A Daubenmire frame reading taken at a data point. Cover values are ocular
 * canopy-cover estimates (percent) following the Daubenmire frame method;
 * dry matter is the clipped, oven-dry biomass scaled to lbs/acre.
 */
export interface FrameSample {
  forageType?: string
  foragePct?: number
  litterPct?: number
  bareGroundPct?: number
  dryMatterLbsAcre?: number
}

export interface DataPoint {
  id: string
  label: string
  lat: number
  lng: number
  /** Optional Daubenmire frame reading captured at this point. */
  sample?: FrameSample
}
