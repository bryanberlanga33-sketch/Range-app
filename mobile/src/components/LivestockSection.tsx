import { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import {
  Card,
  EmptyState,
  ErrorText,
  LabeledInput,
  PrimaryButton,
  SectionTitle,
  Segmented,
} from './ui'
import { PolygonSelector } from './PolygonSelector'
import { HerdCard } from './HerdCard'
import { useCollection } from '@/store/useCollection'
import {
  type Herd,
  type LivestockSpecies,
  type LocationRecord,
} from '@/models'
import { colors, spacing } from '@/theme'

const SPECIES: LivestockSpecies[] = ['Cattle', 'Sheep', 'Goats', 'Horses']

export function LivestockSection({ polygons }: { polygons: LocationRecord[] }) {
  const { items, add, remove, update } = useCollection<Herd>('livestock-herds')

  const [species, setSpecies] = useState<LivestockSpecies>('Cattle')
  const [name, setName] = useState('')
  const [headCount, setHeadCount] = useState('')
  const [pastureId, setPastureId] = useState<string | null>(null)
  const [onRotation, setOnRotation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const n = name.trim()
    const count = Number(headCount)
    if (!n) {
      setError('Please name the herd.')
      return
    }
    if (!Number.isFinite(count) || count <= 0) {
      setError('Head count must be a positive number.')
      return
    }
    const pasture = polygons.find((p) => p.id === pastureId)
    add({
      name: n,
      species,
      headCount: Math.floor(count),
      pastureId: pasture?.id,
      pastureName: pasture?.name,
      onRotation,
      animals: [],
    })
    setName('')
    setHeadCount('')
    setPastureId(null)
    setOnRotation(false)
    setError(null)
  }

  return (
    <Card>
      <SectionTitle>🐄 Livestock herds</SectionTitle>
      <Text style={styles.intro}>
        Create a herd by species and head count, assign it to a pasture, and move the
        whole group between pastures at once.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Species</Text>
        <Segmented<LivestockSpecies>
          options={SPECIES}
          value={species}
          onChange={setSpecies}
        />
      </View>

      <LabeledInput
        label="Herd name"
        placeholder="e.g. North Angus Herd"
        value={name}
        onChangeText={setName}
      />
      <LabeledInput
        label="Head count"
        placeholder="e.g. 48"
        value={headCount}
        onChangeText={setHeadCount}
        keyboardType="number-pad"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Assign to pasture (optional)</Text>
        <PolygonSelector
          polygons={polygons}
          selectedId={pastureId}
          onSelect={setPastureId}
          emptyHint="No polygons yet — create a pasture under Locations to assign herds."
        />
      </View>

      <View style={styles.rotationRow}>
        <Text style={styles.rotationLabel}>Add to pasture rotation</Text>
        <Switch
          value={onRotation}
          onValueChange={setOnRotation}
          trackColor={{ true: colors.accent, false: colors.border }}
        />
      </View>

      {error && <ErrorText>{error}</ErrorText>}
      <PrimaryButton title="Create herd" onPress={handleAdd} />

      <View style={styles.list}>
        <Text style={styles.listHeading}>Herds ({items.length})</Text>
        {items.length === 0 ? (
          <EmptyState>No herds yet. Create one above to start tracking livestock.</EmptyState>
        ) : (
          items.map((herd) => (
            <HerdCard
              key={herd.id}
              herd={herd}
              polygons={polygons}
              onUpdate={(patch) => update(herd.id, patch)}
              onRemove={() => remove(herd.id)}
            />
          ))
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  field: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  rotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rotationLabel: { fontSize: 14, color: colors.text, fontWeight: '600' },
  list: { gap: spacing.md, marginTop: spacing.sm },
  listHeading: { fontSize: 15, fontWeight: '700', color: colors.text },
})
