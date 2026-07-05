import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { MapCanvas } from './map/MapCanvas'
import { makeId, pointInPolygon } from './map/geo'
import type { DataPoint, FrameSample, LatLng } from './map/types'
import { daubenmireClass } from '@/lib/carryingCapacity'

interface DataPointMapperProps {
  boundary: LatLng[]
  dataPoints: DataPoint[]
  onChange: (dataPoints: DataPoint[]) => void
}

function fmt(n: number): string {
  return n.toFixed(5)
}

function sampleFilled(s?: FrameSample): boolean {
  if (!s) return false
  return (
    !!s.forageType ||
    typeof s.foragePct === 'number' ||
    typeof s.litterPct === 'number' ||
    typeof s.bareGroundPct === 'number' ||
    typeof s.dryMatterGrams === 'number'
  )
}

export function DataPointMapper({
  boundary,
  dataPoints,
  onChange,
}: DataPointMapperProps) {
  const [warning, setWarning] = useState<string | null>(null)
  const [openSampleId, setOpenSampleId] = useState<string | null>(null)

  function addPoint(lat: number, lng: number) {
    if (boundary.length >= 3 && !pointInPolygon(lat, lng, boundary)) {
      setWarning('Tap inside the selected polygon to drop a data point.')
      return
    }
    setWarning(null)
    onChange([
      ...dataPoints,
      { id: makeId(), label: `Data point ${dataPoints.length + 1}`, lat, lng },
    ])
  }
  function renamePoint(id: string, label: string) {
    onChange(dataPoints.map((p) => (p.id === id ? { ...p, label } : p)))
  }
  function removePoint(id: string) {
    onChange(dataPoints.filter((p) => p.id !== id))
  }
  function updateSample(id: string, patch: Partial<FrameSample>) {
    onChange(
      dataPoints.map((p) =>
        p.id === id ? { ...p, sample: { ...p.sample, ...patch } } : p,
      ),
    )
  }

  return (
    <View style={styles.container}>
      <MapCanvas
        polygon={boundary}
        dataPoints={dataPoints}
        onMapPress={addPoint}
        height={300}
      />

      {warning && <Text style={styles.warning}>{warning}</Text>}

      <Text style={styles.heading}>Data points ({dataPoints.length})</Text>
      {dataPoints.length === 0 ? (
        <Text style={styles.hint}>
          Tap inside the polygon to add a data point (e.g. a Daubenmire frame
          location). Label each one and add a frame sample below.
        </Text>
      ) : (
        <View style={styles.list}>
          {dataPoints.map((point, index) => {
            const open = openSampleId === point.id
            const filled = sampleFilled(point.sample)
            return (
              <View key={point.id} style={styles.pointCard}>
                <View style={styles.row}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{index + 1}</Text>
                  </View>
                  <View style={styles.body}>
                    <TextInput
                      style={styles.labelInput}
                      value={point.label}
                      onChangeText={(text) => renamePoint(point.id, text)}
                      placeholder={`Data point ${index + 1}`}
                      placeholderTextColor={colors.muted}
                    />
                    <Text style={styles.coords}>
                      {fmt(point.lat)}, {fmt(point.lng)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${point.label}`}
                    onPress={() => removePoint(point.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenSampleId(open ? null : point.id)}
                  style={styles.sampleToggle}
                >
                  <Text style={styles.sampleToggleText}>
                    {open ? '▾' : '▸'} Frame sample (Daubenmire)
                    {filled ? '  ·  ✓ recorded' : ''}
                  </Text>
                </Pressable>

                {open && (
                  <FrameSampleEditor
                    sample={point.sample}
                    onChange={(patch) => updateSample(point.id, patch)}
                  />
                )}
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: number
  onChange: (v: number | undefined) => void
}) {
  const showClass = typeof value === 'number' && !Number.isNaN(value)
  const cls = showClass ? daubenmireClass(value as number) : null
  return (
    <View style={styles.percentField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.percentRow}>
        <TextInput
          style={styles.numInput}
          value={value === undefined ? '' : String(value)}
          onChangeText={(t) => {
            const n = parseFloat(t)
            onChange(t.trim() === '' || Number.isNaN(n) ? undefined : n)
          }}
          keyboardType="numeric"
          placeholder="0–100"
          placeholderTextColor={colors.muted}
        />
        <Text style={styles.percentSign}>%</Text>
        {cls && <Text style={styles.classTag}>class {cls.cls}</Text>}
      </View>
    </View>
  )
}

function FrameSampleEditor({
  sample,
  onChange,
}: {
  sample?: FrameSample
  onChange: (patch: Partial<FrameSample>) => void
}) {
  return (
    <View style={styles.sampleBox}>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Forage type</Text>
        <TextInput
          style={styles.textInput}
          value={sample?.forageType ?? ''}
          onChangeText={(t) => onChange({ forageType: t })}
          placeholder="e.g. Big bluestem, mixed warm-season"
          placeholderTextColor={colors.muted}
        />
      </View>

      <View style={styles.fieldGrid}>
        <PercentField
          label="Forage cover"
          value={sample?.foragePct}
          onChange={(v) => onChange({ foragePct: v })}
        />
        <PercentField
          label="Litter"
          value={sample?.litterPct}
          onChange={(v) => onChange({ litterPct: v })}
        />
        <PercentField
          label="Bare ground"
          value={sample?.bareGroundPct}
          onChange={(v) => onChange({ bareGroundPct: v })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          Dry matter clipped in this 1 m × 1 m frame (grams)
        </Text>
        <TextInput
          style={styles.textInput}
          value={
            sample?.dryMatterGrams === undefined
              ? ''
              : String(sample.dryMatterGrams)
          }
          onChangeText={(t) => {
            const n = parseFloat(t)
            onChange({
              dryMatterGrams: t.trim() === '' || Number.isNaN(n) ? undefined : n,
            })
          }}
          keyboardType="numeric"
          placeholder="Oven-dry forage weight from this frame, grams"
          placeholderTextColor={colors.muted}
        />
      </View>

      <Text style={styles.sampleHint}>
        Each frame is 1 m². Per-frame grams are summed and averaged, then scaled
        by the polygon area to estimate the pasture&apos;s total dry matter. Cover
        is an ocular Daubenmire estimate (classes: 1 = 0–5%, 2 = 5–25%,
        3 = 25–50%, 4 = 50–75%, 5 = 75–95%, 6 = 95–100%).
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  warning: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  heading: { fontSize: 14, fontWeight: '700', color: colors.text },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  list: { gap: spacing.sm },
  pointCard: {
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  body: { flex: 1 },
  labelInput: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 2,
  },
  coords: { fontSize: 12, color: colors.muted },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
  },
  removeText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  sampleToggle: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  sampleToggleText: { fontSize: 13, fontWeight: '700', color: colors.accentStrong },
  sampleBox: { gap: spacing.sm },
  field: { gap: 4 },
  percentField: { gap: 4, minWidth: 92 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  textInput: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  percentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  numInput: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    width: 64,
  },
  percentSign: { fontSize: 13, color: colors.muted },
  classTag: { fontSize: 11, color: colors.accentStrong, fontWeight: '700' },
  sampleHint: { fontSize: 11, color: colors.muted, lineHeight: 15 },
})
