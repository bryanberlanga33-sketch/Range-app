import { useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { Badge, Segmented } from './ui'
import { PolygonSelector } from './PolygonSelector'
import {
  type Animal,
  type AnimalIdType,
  type Herd,
  type LivestockSpecies,
  type LocationRecord,
} from '@/models'
import { makeId } from './map/geo'

const SPECIES_EMOJI: Record<LivestockSpecies, string> = {
  Cattle: '🐄',
  Sheep: '🐑',
  Goats: '🐐',
  Horses: '🐎',
}

interface HerdCardProps {
  herd: Herd
  polygons: LocationRecord[]
  onUpdate: (patch: Partial<Herd> | ((herd: Herd) => Partial<Herd>)) => void
  onRemove: () => void
}

export function HerdCard({ herd, polygons, onUpdate, onRemove }: HerdCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [idType, setIdType] = useState<AnimalIdType>('Name')
  const [identifier, setIdentifier] = useState('')

  function addAnimal() {
    const value = identifier.trim()
    if (!value) return
    if (herd.animals.length >= herd.headCount) return
    const animal: Animal = { id: makeId(), identifier: value, idType }
    onUpdate((h) => ({ animals: [...h.animals, animal] }))
    setIdentifier('')
  }
  function removeAnimal(id: string) {
    onUpdate((h) => ({ animals: h.animals.filter((a) => a.id !== id) }))
  }
  function moveTo(pastureId: string | null) {
    const pasture = polygons.find((p) => p.id === pastureId)
    onUpdate({ pastureId: pasture?.id, pastureName: pasture?.name })
  }

  const namedFull = herd.animals.length >= herd.headCount

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>{SPECIES_EMOJI[herd.species]}</Text>
        <View style={styles.flex}>
          <Text style={styles.name}>{herd.name}</Text>
          <Text style={styles.sub}>
            {herd.species} · {herd.headCount} head
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${herd.name}`}
          onPress={onRemove}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.badges}>
        <Badge
          label={herd.pastureName ? `📍 ${herd.pastureName}` : 'No pasture'}
          color={colors.accentStrong}
          background={colors.accentSoft}
        />
        {herd.onRotation && (
          <Badge label="On rotation" color="#2f4a18" background="#cfe3ba" />
        )}
      </View>

      <View style={styles.rotationRow}>
        <Text style={styles.rotationLabel}>Pasture rotation</Text>
        <Switch
          value={herd.onRotation}
          onValueChange={(v) => onUpdate({ onRotation: v })}
          trackColor={{ true: colors.accent, false: colors.border }}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setExpanded((e) => !e)}
        style={styles.expandButton}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Hide details' : 'Manage herd'} ·{' '}
          {herd.animals.length}/{herd.headCount} identified
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.section}>Move herd to pasture</Text>
          <PolygonSelector
            polygons={polygons}
            selectedId={herd.pastureId ?? null}
            onSelect={moveTo}
            noneLabel="Unassigned"
          />

          <Text style={styles.section}>Identify individual animals</Text>
          <Segmented<AnimalIdType>
            options={['Name', 'Tag']}
            value={idType}
            onChange={setIdType}
          />
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={idType === 'Name' ? 'e.g. Bessie' : 'e.g. Tag 4471'}
              placeholderTextColor={colors.muted}
              editable={!namedFull}
            />
            <Pressable
              accessibilityRole="button"
              onPress={addAnimal}
              disabled={namedFull}
              style={[styles.addButton, namedFull && styles.addButtonDisabled]}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          {namedFull && (
            <Text style={styles.note}>
              All {herd.headCount} head identified. Increase head count to add more.
            </Text>
          )}

          {herd.animals.length > 0 && (
            <View style={styles.animalList}>
              {herd.animals.map((animal) => (
                <View key={animal.id} style={styles.animalRow}>
                  <Text style={styles.animalIcon}>
                    {animal.idType === 'Tag' ? '🏷️' : '🐾'}
                  </Text>
                  <Text style={styles.animalText}>{animal.identifier}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${animal.identifier}`}
                    onPress={() => removeAnimal(animal.id)}
                  >
                    <Text style={styles.animalRemove}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 28 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
  },
  iconText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  rotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rotationLabel: { fontSize: 14, color: colors.text, fontWeight: '600' },
  expandButton: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  expandText: { color: colors.accentStrong, fontWeight: '700', fontSize: 13 },
  details: { gap: spacing.sm, marginTop: spacing.xs },
  section: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  addButtonDisabled: { backgroundColor: colors.accentSoft },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  note: { fontSize: 12, color: colors.muted },
  animalList: { gap: spacing.xs, marginTop: spacing.xs },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  animalIcon: { fontSize: 16 },
  animalText: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  animalRemove: { color: colors.muted, fontSize: 13, fontWeight: '700' },
})
