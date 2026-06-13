import type { JournalEntry } from '@/models'
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
