import { useMemo, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  Card,
  EmptyState,
  ErrorText,
  LabeledInput,
  PrimaryButton,
  RecordItem,
  Screen,
  SectionTitle,
} from '@/components/ui'
import { DataPointMapper } from '@/components/DataPointMapper'
import { CarryingCapacityCard } from '@/components/CarryingCapacityCard'
import type { DataPoint } from '@/components/map/types'
import { polygonAreaAcres } from '@/components/map/geo'
import { useCollection } from '@/store/useCollection'
import {
  locationVertices,
  type Herd,
  type JournalEntry,
  type LocationRecord,
} from '@/models'
import {
  estimateCarryingCapacity,
  herdAnimalUnits,
  summarizeSamples,
} from '@/lib/carryingCapacity'
import { pickImage } from '@/photo'
import { colors, spacing } from '@/theme'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function JournalScreen() {
  const { items, add, remove } = useCollection<JournalEntry>('journal-entries')
  const { items: locations } = useCollection<LocationRecord>('locations')
  const { items: herds } = useCollection<Herd>('livestock-herds')

  const [title, setTitle] = useState('')
  const [conditions, setConditions] = useState('')
  const [locationId, setLocationId] = useState<string | null>(null)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [useFactorPct, setUseFactorPct] = useState(25)
  const [grazingDays, setGrazingDays] = useState(30)
  const [error, setError] = useState<string | null>(null)

  const polygons = useMemo(
    () => locations.filter((loc) => locationVertices(loc).length >= 3),
    [locations],
  )
  const selected = useMemo(
    () => locations.find((loc) => loc.id === locationId) ?? null,
    [locations, locationId],
  )
  const boundary = useMemo(
    () => (selected ? locationVertices(selected) : []),
    [selected],
  )
  const pastureHerds = useMemo(
    () => (selected ? herds.filter((h) => h.pastureId === selected.id) : []),
    [herds, selected],
  )

  function selectPolygon(id: string) {
    if (id === locationId) return
    setLocationId(id)
    setDataPoints([])
  }
  function clearSelection() {
    setLocationId(null)
    setDataPoints([])
  }

  async function attachPhoto() {
    try {
      const uri = await pickImage()
      if (uri) setPhotoUri(uri)
    } catch {
      setError('Could not open the photo library.')
    }
  }

  function handleAdd() {
    const t = title.trim()
    const c = conditions.trim()
    if (!t) {
      setError('Please add a short title for the entry.')
      return
    }
    if (!c) {
      setError('Please describe the conditions you observed.')
      return
    }
    add({
      title: t,
      conditions: c,
      locationId: selected?.id,
      locationName: selected?.name,
      dataPoints: selected ? dataPoints : [],
      photoUri: photoUri ?? undefined,
    })
    setTitle('')
    setConditions('')
    clearSelection()
    setPhotoUri(null)
    setError(null)
  }

  return (
    <Screen>
      <Card>
        <SectionTitle>New journal entry</SectionTitle>
        <LabeledInput
          label="Title"
          placeholder="e.g. North pasture — strong regrowth"
          value={title}
          onChangeText={setTitle}
        />
        <LabeledInput
          label="Conditions & observations"
          placeholder="Soil moisture, forage height, weather, issues..."
          value={conditions}
          onChangeText={setConditions}
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />

        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Map to a property polygon (optional)</Text>
          {polygons.length === 0 ? (
            <Text style={styles.hint}>
              No polygons yet. Create one under the Locations tab to map data
              points within a pasture or property here.
            </Text>
          ) : (
            <View style={styles.chips}>
              <Pressable
                accessibilityRole="button"
                onPress={clearSelection}
                style={[styles.chip, !locationId && styles.chipActive]}
              >
                <Text style={[styles.chipText, !locationId && styles.chipTextActive]}>
                  None
                </Text>
              </Pressable>
              {polygons.map((loc) => {
                const active = loc.id === locationId
                return (
                  <Pressable
                    key={loc.id}
                    accessibilityRole="button"
                    onPress={() => selectPolygon(loc.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      📍 {loc.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        {selected && (
          <DataPointMapper
            boundary={boundary}
            dataPoints={dataPoints}
            onChange={setDataPoints}
          />
        )}

        {selected && (
          <CarryingCapacityCard
            boundary={boundary}
            dataPoints={dataPoints}
            herds={pastureHerds}
            useFactorPct={useFactorPct}
            grazingDays={grazingDays}
            onChangeUseFactor={setUseFactorPct}
            onChangeGrazingDays={setGrazingDays}
          />
        )}

        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Property photo (optional)</Text>
          {photoUri ? (
            <View style={styles.photoRow}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable
                accessibilityRole="button"
                onPress={() => setPhotoUri(null)}
                style={styles.photoRemove}
              >
                <Text style={styles.photoRemoveText}>Remove photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={attachPhoto}
              style={styles.photoButton}
            >
              <Text style={styles.photoButtonText}>＋ Add a photo</Text>
            </Pressable>
          )}
        </View>

        {error && <ErrorText>{error}</ErrorText>}
        <PrimaryButton title="Save entry" onPress={handleAdd} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>Entries ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>No entries yet. Log your first rangeland observation above.</EmptyState>
        ) : (
          items.map((entry) => {
            const pts = entry.dataPoints ?? []
            const metaParts = [formatDate(entry.createdAt)]
            if (entry.locationName) {
              metaParts.push(
                `📍 ${entry.locationName}${
                  pts.length > 0
                    ? ` · ${pts.length} data point${pts.length === 1 ? '' : 's'}`
                    : ''
                }`,
              )
            }
            if (entry.locationId) {
              const loc = locations.find((l) => l.id === entry.locationId)
              const cap = estimateCarryingCapacity({
                areaAcres: loc ? polygonAreaAcres(locationVertices(loc)) : 0,
                summary: summarizeSamples(pts),
                useFactorPct: 25,
                grazingDays: 30,
                herdAU: herdAnimalUnits(
                  herds.filter((h) => h.pastureId === entry.locationId),
                ),
              })
              if (cap.computable && cap.aums !== undefined) {
                metaParts.push(
                  `🐂 ${cap.aums.toFixed(1)} AUMs (~${(
                    cap.animalUnitsForPeriod ?? 0
                  ).toFixed(1)} AU/30d)`,
                )
              }
            }
            return (
              <RecordItem
                key={entry.id}
                emoji="📓"
                title={entry.title}
                subtitle={entry.conditions}
                meta={metaParts.join('  ·  ')}
                thumbnailUri={entry.photoUri}
                onRemove={() => remove(entry.id)}
              />
            )
          })
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#fdfcf9',
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.accentStrong },
  photoButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#fdfcf9',
  },
  photoButtonText: { color: colors.accentStrong, fontWeight: '600', fontSize: 14 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  photoPreview: { width: 88, height: 88, borderRadius: 10 },
  photoRemove: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  photoRemoveText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
})
