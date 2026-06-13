import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { JournalEntry } from '@/models'
import { analyzePasture, type MetricTrend } from '@/lib/pastureTrends'
import { colors, spacing } from '@/theme'

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function round(n: number): string {
  return Math.round(n).toLocaleString()
}

const VERDICTS: Record<
  string,
  { label: string; arrow: string; tone: 'good' | 'bad' | 'neutral' }
> = {
  improving: { label: 'Improving', arrow: '↗', tone: 'good' },
  declining: { label: 'Declining', arrow: '↘', tone: 'bad' },
  mixed: { label: 'Mixed', arrow: '↔', tone: 'neutral' },
  stable: { label: 'Stable', arrow: '→', tone: 'neutral' },
  insufficient: { label: 'Not enough data', arrow: '·', tone: 'neutral' },
}

function MetricRow({ m }: { m: MetricTrend }) {
  if (m.first === undefined || m.latest === undefined || m.points < 2) {
    return null
  }
  const arrow = m.direction === 'up' ? '▲' : m.direction === 'down' ? '▼' : '→'
  const toneStyle =
    m.good === true ? styles.good : m.good === false ? styles.bad : styles.flat
  const delta = m.delta ?? 0
  const sign = delta > 0 ? '+' : ''
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{m.label}</Text>
      <Text style={styles.metricValues}>
        {round(m.first)}
        {m.unit} → {round(m.latest)}
        {m.unit}
      </Text>
      <Text style={[styles.metricDelta, toneStyle]}>
        {arrow} {sign}
        {round(delta)}
        {m.unit}
      </Text>
    </View>
  )
}

export function PastureTrends({ journals }: { journals: JournalEntry[] }) {
  const report = useMemo(() => analyzePasture(journals), [journals])
  const { observations, metrics, verdict, suggestions } = report

  if (observations.length === 0) return null

  const v = VERDICTS[verdict]
  const verdictStyle =
    v.tone === 'good'
      ? styles.badgeGood
      : v.tone === 'bad'
        ? styles.badgeBad
        : styles.badgeNeutral
  const first = observations[0]
  const last = observations[observations.length - 1]
  const hasComparisons = metrics.some(
    (m) => m.points >= 2 && m.first !== undefined,
  )

  return (
    <View style={styles.block}>
      <View style={styles.headerRow}>
        <Text style={styles.blockHead}>📈 Conditions over time</Text>
        <View style={[styles.badge, verdictStyle]}>
          <Text style={styles.badgeText}>
            {v.arrow} {v.label}
          </Text>
        </View>
      </View>

      <Text style={styles.range}>
        {observations.length} reading{observations.length === 1 ? '' : 's'}
        {observations.length >= 2
          ? ` · ${fmtDate(first.date)} → ${fmtDate(last.date)}`
          : ` · ${fmtDate(last.date)}`}
      </Text>

      {observations.length < 2 ? (
        <Text style={styles.muted}>
          Log frame samples on at least two visits to compare how this pasture
          changes over time.
        </Text>
      ) : (
        <>
          {hasComparisons && (
            <View style={styles.metrics}>
              {metrics.map((m) => (
                <MetricRow key={m.key} m={m} />
              ))}
            </View>
          )}

          {suggestions.length > 0 && (
            <View style={styles.tips}>
              <Text style={styles.tipsHead}>💡 Suggestions</Text>
              {suggestions.map((tip, i) => (
                <Text key={i} style={styles.tip}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  blockHead: { fontSize: 14, fontWeight: '700', color: colors.accentStrong },
  badge: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  badgeGood: { backgroundColor: '#cfe3ba' },
  badgeBad: { backgroundColor: '#f6dcd5' },
  badgeNeutral: { backgroundColor: colors.accentSoft },
  range: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  metrics: { gap: 2, marginTop: 2 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metricLabel: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  metricValues: { fontSize: 12, color: colors.muted },
  metricDelta: { fontSize: 12, fontWeight: '800', minWidth: 72, textAlign: 'right' },
  good: { color: '#3f5a26' },
  bad: { color: colors.danger },
  flat: { color: colors.muted },
  tips: { gap: 3, marginTop: spacing.xs },
  tipsHead: { fontSize: 13, fontWeight: '700', color: colors.text },
  tip: { fontSize: 12, color: colors.text, lineHeight: 17 },
})
