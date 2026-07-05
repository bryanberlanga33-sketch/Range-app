import type { DataPoint, FrameSample } from '@/components/map/types'
import type { Herd, LivestockSpecies } from '@/models'

/**
 * Daubenmire canopy-cover classes. Each ocular reading is binned into one of
 * six classes; the class midpoint is the value used in calculations.
 */
export const COVER_CLASSES = [
  { cls: 1, min: 0, max: 5, mid: 2.5 },
  { cls: 2, min: 5, max: 25, mid: 15 },
  { cls: 3, min: 25, max: 50, mid: 37.5 },
  { cls: 4, min: 50, max: 75, mid: 62.5 },
  { cls: 5, min: 75, max: 95, mid: 85 },
  { cls: 6, min: 95, max: 100, mid: 97.5 },
] as const

export type CoverClass = (typeof COVER_CLASSES)[number]

/** Returns the Daubenmire cover class containing the given percent. */
export function daubenmireClass(pct: number): CoverClass {
  for (const c of COVER_CLASSES) {
    if (pct <= c.max) return c
  }
  return COVER_CLASSES[COVER_CLASSES.length - 1]
}

/**
 * Animal Unit Equivalents. 1 AU = one 1,000-lb cow (with calf) consuming about
 * 26 lbs of dry matter per day. Other species are scaled to that baseline.
 */
export const ANIMAL_UNIT_EQUIV: Record<LivestockSpecies, number> = {
  Cattle: 1.0,
  Horses: 1.25,
  Sheep: 0.2,
  Goats: 0.17,
}

export const AU_INTAKE_LBS_PER_DAY = 26
export const DAYS_PER_MONTH = 30.4
/** Dry matter (lbs) one animal unit consumes in a month (one AUM). */
export const AUM_LBS = AU_INTAKE_LBS_PER_DAY * DAYS_PER_MONTH

export const SQ_METERS_PER_ACRE = 4046.8564224
export const GRAMS_PER_LB = 453.59237
/** 1 g per 1 m² frame === this many lbs per acre. */
export const G_PER_M2_TO_LB_PER_ACRE = SQ_METERS_PER_ACRE / GRAMS_PER_LB

export interface SampleSummary {
  /** Total frame samples recorded. */
  count: number
  /** Frames that have a clipped dry-matter weight. */
  framesWithDm: number
  /** Σ grams of dry matter clipped across all 1 m² frames. */
  sumGrams?: number
  /** Mean dry matter density (each frame is 1 m², so this is g/m²). */
  meanGramsPerM2?: number
  /** Mean density expressed as lbs/acre. */
  meanDmLbsAcre?: number
  meanForagePct?: number
  meanLitterPct?: number
  meanBarePct?: number
}

function mean(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  return values.reduce((a, b) => a + b, 0) / values.length
}

function isNum(v: number | undefined): v is number {
  return typeof v === 'number' && !Number.isNaN(v)
}

/** Averages the Daubenmire frame readings across a pasture's data points. */
export function summarizeSamples(dataPoints: DataPoint[]): SampleSummary {
  const samples = dataPoints
    .map((p) => p.sample)
    .filter((s): s is FrameSample => !!s)
  const grams = samples.map((s) => s.dryMatterGrams).filter(isNum)
  const sumGrams = grams.length
    ? grams.reduce((a, b) => a + b, 0)
    : undefined
  const meanGramsPerM2 =
    grams.length && sumGrams !== undefined ? sumGrams / grams.length : undefined
  const meanDmLbsAcre =
    meanGramsPerM2 !== undefined
      ? meanGramsPerM2 * G_PER_M2_TO_LB_PER_ACRE
      : undefined
  return {
    count: samples.length,
    framesWithDm: grams.length,
    sumGrams,
    meanGramsPerM2,
    meanDmLbsAcre,
    meanForagePct: mean(samples.map((s) => s.foragePct).filter(isNum)),
    meanLitterPct: mean(samples.map((s) => s.litterPct).filter(isNum)),
    meanBarePct: mean(samples.map((s) => s.bareGroundPct).filter(isNum)),
  }
}

/** Total animal units currently stocked on a pasture, from its herds. */
export function herdAnimalUnits(herds: Herd[]): number {
  return herds.reduce(
    (sum, h) => sum + (h.headCount || 0) * (ANIMAL_UNIT_EQUIV[h.species] ?? 1),
    0,
  )
}

export interface CarryingCapacityInput {
  areaAcres: number
  summary: SampleSummary
  /** Proper-use / harvest-efficiency factor, percent (e.g. 25 = take 25%). */
  useFactorPct: number
  /** Length of the grazing period, days. */
  grazingDays: number
  /** Current stocking, in animal units (from the pasture's herds). */
  herdAU: number
}

export interface CarryingCapacityResult {
  computable: boolean
  reason?: string
  areaAcres: number
  herdAU: number
  sumGrams?: number
  framesWithDm?: number
  meanGramsPerM2?: number
  dmLbsPerAcre?: number
  /** Estimated total dry matter for the whole pasture (lbs). */
  totalDmLbs?: number
  foragePctUsed?: number
  forageDmLbsAcre?: number
  totalForageLbs?: number
  allocableLbs?: number
  aums?: number
  animalUnitsForPeriod?: number
  acresPerAum?: number
  monthsAtCurrentHerd?: number
}

/**
 * Estimates pasture dry matter and carrying capacity from 1 m² frame clips.
 *
 * Frames are summed and averaged to a per-m² density, scaled by the polygon
 * area to a whole-pasture dry matter, then narrowed to forage by the mean
 * forage canopy fraction. Allocable forage applies the proper-use factor, and
 * demand is one AU eating ~26 lbs DM/day (one AUM ≈ 790 lbs).
 */
export function estimateCarryingCapacity(
  input: CarryingCapacityInput,
): CarryingCapacityResult {
  const { areaAcres, summary, useFactorPct, grazingDays, herdAU } = input
  const base: CarryingCapacityResult = { computable: false, areaAcres, herdAU }

  if (areaAcres <= 0) {
    return {
      ...base,
      reason: 'Draw a polygon fence (3+ points) under Locations to set the pasture area.',
    }
  }
  if (!isNum(summary.meanGramsPerM2) || summary.framesWithDm === 0) {
    return {
      ...base,
      reason:
        'Enter the dry matter clipped (grams) on at least one 1 m² frame sample.',
    }
  }

  const dmLbsPerAcre = summary.meanGramsPerM2 * G_PER_M2_TO_LB_PER_ACRE
  const totalDmLbs = dmLbsPerAcre * areaAcres
  const foragePct = isNum(summary.meanForagePct) ? summary.meanForagePct : 100
  const forageDmLbsAcre = dmLbsPerAcre * (foragePct / 100)
  const totalForageLbs = forageDmLbsAcre * areaAcres
  const allocableLbs = totalForageLbs * (useFactorPct / 100)
  const aums = allocableLbs / AUM_LBS
  const days = grazingDays > 0 ? grazingDays : 1
  const animalUnitsForPeriod = allocableLbs / (AU_INTAKE_LBS_PER_DAY * days)
  const acresPerAum = aums > 0 ? areaAcres / aums : undefined
  const monthsAtCurrentHerd = herdAU > 0 ? aums / herdAU : undefined

  return {
    computable: true,
    areaAcres,
    herdAU,
    sumGrams: summary.sumGrams,
    framesWithDm: summary.framesWithDm,
    meanGramsPerM2: summary.meanGramsPerM2,
    dmLbsPerAcre,
    totalDmLbs,
    foragePctUsed: foragePct,
    forageDmLbsAcre,
    totalForageLbs,
    allocableLbs,
    aums,
    animalUnitsForPeriod,
    acresPerAum,
    monthsAtCurrentHerd,
  }
}
