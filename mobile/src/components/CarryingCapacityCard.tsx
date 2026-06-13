import { useMemo } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { polygonAreaAcres } from './map/geo'
import type { DataPoint, LatLng } from './map/types'
import type { Herd } from '@/models'
import {
  estimateCarryingCapacity,
  herdAnimalUnits,
  summarizeSamples,
} from '@/lib/carryingCapacity'

interface CarryingCapacityCardProps {
  boundary: LatLng[]
  dataPoints: DataPoint[]
  herds: Herd[]
  useFactorPct: number
  grazingDays: number
  onChangeUseFactor: (v: number) => void
  onChangeGrazingDays: (v: number) => void
}

function round(n: number, digits = 0): string {
  const f = Math.pow(10, digits)
  return (Math.round(n * f) / f).toLocaleString(undefined, {
    maximumFractionDigits: digits,
  })
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export function CarryingCapacityCard({
  boundary,
  dataPoints,
  herds,
  useFactorPct,
  grazingDays,
  onChangeUseFactor,
  onChangeGrazingDays,
}: CarryingCapacityCardProps) {
  const areaAcres = useMemo(() => polygonAreaAcres(boundary), [boundary])
  const summary = useMemo(() => summarizeSamples(dataPoints), [dataPoints])
  const herdAU = useMemo(() => herdAnimalUnits(herds), [herds])

  const result = useMemo(
    () =>
      estimateCarryingCapacity({
        areaAcres,
        summary,
        useFactorPct,
        grazingDays,
        herdAU,
      }),
    [areaAcres, summary, useFactorPct, grazingDays, herdAU],
  )

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🐂 Carrying capacity (Daubenmire estimate)</Text>
      <Text style={styles.subtitle}>
        Averages this entry&apos;s frame samples across the pasture to estimate how
        much livestock the area can carry.
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>📐 {round(areaAcres, 1)} acres</Text>
        <Text style={styles.metaText}>🔲 {summary.count} frame sample
          {summary.count === 1 ? '' : 's'}</Text>
        {herdAU > 0 && (
          <Text style={styles.metaText}>🐄 {round(herdAU, 1)} AU stocked</Text>
        )}
      </View>

      {summary.count > 0 && (
        <View style={styles.coverRow}>
          {summary.meanForagePct !== undefined && (
            <Text style={styles.coverText}>
              Forage {round(summary.meanForagePct)}%
            </Text>
          )}
          {summary.meanLitterPct !== undefined && (
            <Text style={styles.coverText}>
              Litter {round(summary.meanLitterPct)}%
            </Text>
          )}
          {summary.meanBarePct !== undefined && (
            <Text style={styles.coverText}>
              Bare {round(summary.meanBarePct)}%
            </Text>
          )}
          {summary.meanDryMatter !== undefined && (
            <Text style={styles.coverText}>
              DM {round(summary.meanDryMatter)} lb/ac
            </Text>
          )}
        </View>
      )}

      <View style={styles.inputsRow}>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Proper-use factor (%)</Text>
          <TextInput
            style={styles.input}
            value={String(useFactorPct)}
            onChangeText={(t) => {
              const n = parseFloat(t)
              onChangeUseFactor(Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n)))
            }}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>Grazing period (days)</Text>
          <TextInput
            style={styles.input}
            value={String(grazingDays)}
            onChangeText={(t) => {
              const n = parseFloat(t)
              onChangeGrazingDays(Number.isNaN(n) ? 0 : Math.max(0, n))
            }}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      {!result.computable ? (
        <Text style={styles.reason}>{result.reason}</Text>
      ) : (
        <>
          <View style={styles.stats}>
            <Stat label="AUMs available" value={round(result.aums ?? 0, 1)} />
            <Stat
              label={`animal units · ${round(grazingDays)} days`}
              value={round(result.animalUnitsForPeriod ?? 0, 1)}
            />
            <Stat
              label="acres / AUM"
              value={result.acresPerAum ? round(result.acresPerAum, 1) : '—'}
            />
          </View>

          <Text style={styles.detail}>
            Forage dry matter ≈ {round(result.forageDmLbsAcre ?? 0)} lb/acre
            {result.foragePctUsed !== undefined
              ? ` (at ${round(result.foragePctUsed)}% forage cover)`
              : ''}
            . Allocable at {round(useFactorPct)}% use:{' '}
            {round(result.allocableLbs ?? 0)} lb.
          </Text>

          {herdAU > 0 && result.monthsAtCurrentHerd !== undefined && (
            <Text
              style={[
                styles.verdict,
                result.monthsAtCurrentHerd >= grazingDays / 30.4
                  ? styles.verdictOk
                  : styles.verdictWarn,
              ]}
            >
              {result.monthsAtCurrentHerd >= grazingDays / 30.4 ? '✅' : '⚠️'} Current
              herd is {round(herdAU, 1)} AU — forage supports about{' '}
              {round(result.monthsAtCurrentHerd, 1)} month
              {result.monthsAtCurrentHerd === 1 ? '' : 's'} of grazing at this
              stocking.
            </Text>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.accentStrong },
  subtitle: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaText: { fontSize: 13, fontWeight: '700', color: colors.text },
  coverRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  coverText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentStrong,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  inputsRow: { flexDirection: 'row', gap: spacing.md },
  inputField: { flex: 1, gap: 4 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  reason: { fontSize: 13, color: colors.muted, lineHeight: 18, fontStyle: 'italic' },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.accentStrong },
  statLabel: { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 2 },
  detail: { fontSize: 12, color: colors.text, lineHeight: 17 },
  verdict: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  verdictOk: { color: colors.accent },
  verdictWarn: { color: colors.danger },
})
