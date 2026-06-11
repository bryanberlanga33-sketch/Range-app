import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  Card,
  EmptyState,
  ErrorText,
  LabeledInput,
  PrimaryButton,
  RecordItem,
  SectionTitle,
} from './ui'
import { PolygonSelector } from './PolygonSelector'
import { MapCanvas } from './map/MapCanvas'
import { pointInPolygon } from './map/geo'
import { useCollection } from '@/store/useCollection'
import {
  locationVertices,
  type LatLng,
  type LocationRecord,
  type WildlifeSighting,
} from '@/models'
import { colors, spacing } from '@/theme'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function WildlifeSection({ polygons }: { polygons: LocationRecord[] }) {
  const { items, add, remove } = useCollection<WildlifeSighting>('wildlife-sightings')

  const [species, setSpecies] = useState('')
  const [count, setCount] = useState('')
  const [pastureId, setPastureId] = useState<string | null>(null)
  const [location, setLocation] = useState<LatLng | null>(null)
  const [notes, setNotes] = useState('')
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => polygons.find((p) => p.id === pastureId) ?? null,
    [polygons, pastureId],
  )
  const boundary = useMemo(
    () => (selected ? locationVertices(selected) : []),
    [selected],
  )

  function selectPasture(id: string | null) {
    setPastureId(id)
    setLocation(null)
    setWarning(null)
  }

  function placeSighting(lat: number, lng: number) {
    if (boundary.length >= 3 && !pointInPolygon(lat, lng, boundary)) {
      setWarning('Tap inside the selected polygon to mark where you saw the animal.')
      return
    }
    setWarning(null)
    setLocation({ lat, lng })
  }

  function handleAdd() {
    const s = species.trim()
    if (!s) {
      setError('Please enter the species you saw.')
      return
    }
    add({
      species: s,
      count: count.trim() || undefined,
      pastureId: selected?.id,
      pastureName: selected?.name,
      location: location ?? undefined,
      notes: notes.trim() || undefined,
    })
    setSpecies('')
    setCount('')
    setPastureId(null)
    setLocation(null)
    setNotes('')
    setError(null)
  }

  return (
    <Card>
      <SectionTitle>🦌 Wildlife sightings</SectionTitle>
      <Text style={styles.intro}>
        Record a sighting and mark where and when you saw the animal within a pasture.
      </Text>

      <LabeledInput
        label="Species"
        placeholder="e.g. Mule deer"
        value={species}
        onChangeText={setSpecies}
      />
      <LabeledInput
        label="Count (optional)"
        placeholder="e.g. 6"
        value={count}
        onChangeText={setCount}
        keyboardType="number-pad"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Seen in pasture (optional)</Text>
        <PolygonSelector
          polygons={polygons}
          selectedId={pastureId}
          onSelect={selectPasture}
          emptyHint="No polygons yet — create a pasture under Locations to map sightings."
        />
      </View>

      {selected && (
        <View style={styles.field}>
          <Text style={styles.label}>
            Where did you see it? Tap inside {selected.name}.
          </Text>
          <MapCanvas
            polygon={boundary}
            dataPoints={
              location
                ? [{ id: 'sighting', label: species || 'Sighting', ...location }]
                : []
            }
            onMapPress={placeSighting}
            height={260}
          />
          {warning && <ErrorText>{warning}</ErrorText>}
          {location && (
            <Text style={styles.coords}>
              Marked at {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </Text>
          )}
        </View>
      )}

      <LabeledInput
        label="Notes (optional)"
        placeholder="Behavior, direction of travel, herd makeup..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />

      {error && <ErrorText>{error}</ErrorText>}
      <PrimaryButton title="Record sighting" onPress={handleAdd} />

      <View style={styles.list}>
        <Text style={styles.listHeading}>Sightings ({items.length})</Text>
        {items.length === 0 ? (
          <EmptyState>No sightings yet. Record wildlife you spot on the range.</EmptyState>
        ) : (
          items.map((sighting) => {
            const meta = [`Seen ${formatDate(sighting.createdAt)}`]
            if (sighting.count) meta.push(`${sighting.count} seen`)
            if (sighting.pastureName) meta.push(`📍 ${sighting.pastureName}`)
            if (sighting.location) {
              meta.push(
                `${sighting.location.lat.toFixed(4)}, ${sighting.location.lng.toFixed(4)}`,
              )
            }
            return (
              <RecordItem
                key={sighting.id}
                emoji="🦌"
                title={sighting.species}
                subtitle={sighting.notes || undefined}
                meta={meta.join('  ·  ')}
                onRemove={() => remove(sighting.id)}
              />
            )
          })
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  field: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  coords: { fontSize: 12, color: colors.muted },
  list: { gap: spacing.md, marginTop: spacing.sm },
  listHeading: { fontSize: 15, fontWeight: '700', color: colors.text },
})
