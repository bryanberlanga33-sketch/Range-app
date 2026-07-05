import type { JournalEntry, PlantRecord } from '@/models'
import type { FrameSample } from '@/components/map/types'
import { G_PER_M2_TO_LB_PER_ACRE } from './carryingCapacity'

/**
 * Time-series analysis of a pasture's Daubenmire frame readings. Each journal
 * entry that carries frame samples becomes one dated observation (the mean of
 * its frames); observations are compared over time to flag whether range
 * conditions are improving or declining and to suggest management actions.
 */
export interface Observation {
  date: number
  foragePct?: number
  litterPct?: number
  barePct?: number
  dmLbAcre?: number
  frames: number
}

export type Direction = 'up' | 'down' | 'flat'

export interface MetricTrend {
  key: 'forage' | 'litter' | 'bare' | 'dm'
  label: string
  unit: string
  first?: number
  latest?: number
  delta?: number
  direction: Direction
  /** Whether the change is good for range health (null when flat/insufficient). */
  good: boolean | null
  points: number
}

export interface TrendReport {
  observations: Observation[]
  metrics: MetricTrend[]
  verdict: 'improving' | 'declining' | 'mixed' | 'stable' | 'insufficient'
  suggestions: string[]
}

function isNum(v: number | undefined): v is number {
  return typeof v === 'number' && !Number.isNaN(v)
}

function mean(values: number[]): number | undefined {
  if (values.length === 0) return undefined
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** Builds one dated observation per journal entry that carries frame samples. */
export function buildObservations(journals: JournalEntry[]): Observation[] {
  const obs: Observation[] = []
  for (const j of journals) {
    const samples = (j.dataPoints ?? [])
      .map((p) => p.sample)
      .filter((s): s is FrameSample => !!s)
    if (samples.length === 0) continue
    const forage = mean(samples.map((s) => s.foragePct).filter(isNum))
    const litter = mean(samples.map((s) => s.litterPct).filter(isNum))
    const bare = mean(samples.map((s) => s.bareGroundPct).filter(isNum))
    const grams = samples.map((s) => s.dryMatterGrams).filter(isNum)
    const dmLbAcre =
      grams.length > 0
        ? (mean(grams) as number) * G_PER_M2_TO_LB_PER_ACRE
        : undefined
    if (
      forage === undefined &&
      litter === undefined &&
      bare === undefined &&
      dmLbAcre === undefined
    ) {
      continue
    }
    obs.push({
      date: j.createdAt,
      foragePct: forage,
      litterPct: litter,
      barePct: bare,
      dmLbAcre,
      frames: samples.length,
    })
  }
  obs.sort((a, b) => a.date - b.date)
  return obs
}

function direction(
  first: number | undefined,
  latest: number | undefined,
  threshold: number,
): Direction {
  if (first === undefined || latest === undefined) return 'flat'
  const d = latest - first
  if (d > threshold) return 'up'
  if (d < -threshold) return 'down'
  return 'flat'
}

function buildMetric(
  obs: Observation[],
  key: MetricTrend['key'],
  label: string,
  unit: string,
  pick: (o: Observation) => number | undefined,
  thresholdFor: (first: number) => number,
  higherIsBetter: boolean,
): MetricTrend {
  const series = obs
    .map((o) => ({ date: o.date, value: pick(o) }))
    .filter((x): x is { date: number; value: number } => isNum(x.value))
  const first = series[0]?.value
  const latest = series[series.length - 1]?.value
  const threshold = first !== undefined ? thresholdFor(first) : 0
  const dir = series.length >= 2 ? direction(first, latest, threshold) : 'flat'
  const good =
    dir === 'flat'
      ? null
      : higherIsBetter
        ? dir === 'up'
        : dir === 'down'
  return {
    key,
    label,
    unit,
    first,
    latest,
    delta:
      first !== undefined && latest !== undefined ? latest - first : undefined,
    direction: dir,
    good,
    points: series.length,
  }
}

function buildSuggestions(metrics: MetricTrend[]): string[] {
  const by = (k: MetricTrend['key']) => metrics.find((m) => m.key === k)!
  const forage = by('forage')
  const litter = by('litter')
  const bare = by('bare')
  const dm = by('dm')
  const tips: string[] = []

  if (
    bare.latest !== undefined &&
    (bare.latest >= 30 || bare.direction === 'up')
  ) {
    tips.push(
      `Bare ground is ${bare.direction === 'up' ? 'rising' : 'high'} (~${Math.round(
        bare.latest,
      )}%). Reduce stocking density, defer grazing to let plants recover, and consider interseeding or reseeding to rebuild ground cover.`,
    )
  }
  if (
    forage.latest !== undefined &&
    (forage.latest < 40 || forage.direction === 'down')
  ) {
    tips.push(
      `Forage cover is ${forage.direction === 'down' ? 'declining' : 'low'} (~${Math.round(
        forage.latest,
      )}%). Lengthen rest periods and ease grazing pressure so desirable plants can recover.`,
    )
  }
  if (litter.latest !== undefined && litter.latest < 15) {
    tips.push(
      `Litter is sparse (~${Math.round(
        litter.latest,
      )}%). Leave more residual ("take half, leave half") to shade the soil, hold moisture, and build organic matter.`,
    )
  }
  if (dm.direction === 'down' && dm.first !== undefined && dm.latest !== undefined) {
    tips.push(
      `Forage production is trending down (${Math.round(dm.first)} → ${Math.round(
        dm.latest,
      )} lb/acre). Rest the pasture or rotate livestock off sooner, and watch for overgrazing or drought stress.`,
    )
  }
  if (forage.direction === 'up' && dm.direction === 'up') {
    tips.push(
      'Forage cover and production are both up — current rotation and rest periods are working. Keep the rotation going and maintain monitoring.',
    )
  }
  if (bare.direction === 'down' && bare.good) {
    tips.push(
      'Bare ground is shrinking — ground cover is recovering. Stay the course and avoid grazing too short.',
    )
  }
  if (tips.length === 0) {
    tips.push(
      'Conditions look stable. Maintain current management, keep a consistent rotation, and continue logging frame samples each visit.',
    )
  }
  return tips.slice(0, 4)
}

export function analyzePasture(journals: JournalEntry[]): TrendReport {
  const observations = buildObservations(journals)
  const metrics: MetricTrend[] = [
    buildMetric(
      observations,
      'forage',
      'Forage cover',
      '%',
      (o) => o.foragePct,
      () => 2,
      true,
    ),
    buildMetric(
      observations,
      'litter',
      'Litter',
      '%',
      (o) => o.litterPct,
      () => 2,
      true,
    ),
    buildMetric(
      observations,
      'bare',
      'Bare ground',
      '%',
      (o) => o.barePct,
      () => 2,
      false,
    ),
    buildMetric(
      observations,
      'dm',
      'Dry matter',
      ' lb/ac',
      (o) => o.dmLbAcre,
      (first) => Math.max(25, first * 0.05),
      true,
    ),
  ]

  let verdict: TrendReport['verdict']
  if (observations.length < 2) {
    verdict = 'insufficient'
  } else {
    const good = metrics.filter((m) => m.good === true).length
    const bad = metrics.filter((m) => m.good === false).length
    if (good > bad) verdict = 'improving'
    else if (bad > good) verdict = 'declining'
    else if (good === 0 && bad === 0) verdict = 'stable'
    else verdict = 'mixed'
  }

  return {
    observations,
    metrics,
    verdict,
    suggestions: observations.length === 0 ? [] : buildSuggestions(metrics),
  }
}

// --- Plant composition analysis -------------------------------------------

export interface PlantComposition {
  total: number
  counts: { Great: number; Good: number; Fair: number; Bad: number }
  /** Distinct Good/Great species count. */
  desirableSpecies: number
  /** Distinct undesirable (Bad/Fair) common names. */
  undesirableNames: string[]
  suggestions: string[]
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function buildPlantSuggestions(
  plants: PlantRecord[],
  desirable: PlantRecord[],
  undesirable: PlantRecord[],
  counts: PlantComposition['counts'],
  desirableSpecies: number,
): string[] {
  const tips: string[] = []
  const undesirableNames = uniq(undesirable.map((p) => p.commonName))
  const hasCat = (list: PlantRecord[], cat: PlantRecord['category']) =>
    list.some((p) => p.category === cat)

  if (undesirable.length > 0) {
    const names = undesirableNames.slice(0, 3).join(', ')
    tips.push(
      `Decrease less-desirable plants${names ? ` (${names})` : ''}: avoid overgrazing — it bares the ground and lets weeds spread — and hit them with well-timed control before they set seed.`,
    )
    if (hasCat(undesirable, 'Brush')) {
      tips.push(
        'For brushy/woody species, use targeted browsing (e.g. goats), mechanical removal, prescribed fire, or spot herbicide, then reseed the openings with desirable grasses.',
      )
    }
    if (hasCat(undesirable, 'Forb')) {
      tips.push(
        'For weedy forbs, mow or spot-treat before they flower and seed, and keep a vigorous grass stand so they get crowded out.',
      )
    }
    if (hasCat(undesirable, 'Grass')) {
      tips.push(
        'For undesirable grasses, graze or hay them hard before seed-set, then reseed with perennial native grasses.',
      )
    }
  }

  if (desirableSpecies < 3 || counts.Great === 0) {
    tips.push(
      'Increase the variety of Good/Great forage: interseed or reseed a mix of adapted native grasses and legumes (both warm- and cool-season) matched to your soils and rainfall.',
    )
  }
  if (desirable.length > 0) {
    tips.push(
      'Help Good/Great plants multiply: rest pastures through the growing season so they can flower and set seed, and use rotational grazing so livestock cannot repeatedly graze the best plants.',
    )
    tips.push(
      'Add legumes (clovers or native legumes) to lift forage quality and fix natural soil nitrogen, which favors desirable species over weeds.',
    )
  }
  if (tips.length === 0) {
    tips.push(
      'Plant composition looks strong — keep it that way with rest and rotation so desirable species keep setting seed.',
    )
  }
  return tips.slice(0, 5)
}

/** Summarizes a pasture's plant records and suggests how to shift composition. */
export function analyzePlants(plants: PlantRecord[]): PlantComposition {
  const counts = { Great: 0, Good: 0, Fair: 0, Bad: 0 }
  plants.forEach((p) => {
    if (p.forageValue in counts) counts[p.forageValue as ForageKey] += 1
  })
  const desirable = plants.filter(
    (p) => p.forageValue === 'Good' || p.forageValue === 'Great',
  )
  const undesirable = plants.filter(
    (p) => p.forageValue === 'Bad' || p.forageValue === 'Fair',
  )
  const desirableSpecies = uniq(desirable.map((p) => p.commonName)).length
  return {
    total: plants.length,
    counts,
    desirableSpecies,
    undesirableNames: uniq(undesirable.map((p) => p.commonName)),
    suggestions: buildPlantSuggestions(
      plants,
      desirable,
      undesirable,
      counts,
      desirableSpecies,
    ),
  }
}

type ForageKey = keyof PlantComposition['counts']
