import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
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
import { BaseRecord, useCollection } from '@/store/useCollection'
import { colors, spacing } from '@/theme'

type Kind = 'Livestock' | 'Wildlife'

interface SightingRecord extends BaseRecord {
  kind: Kind
  species: string
  count: string
  notes: string
}

export default function WildlifeScreen() {
  const { items, add, remove } = useCollection<SightingRecord>('livestock-wildlife')
  const [kind, setKind] = useState<Kind>('Livestock')
  const [species, setSpecies] = useState('')
  const [count, setCount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const s = species.trim()
    if (!s) {
      setError('Please enter the species or type.')
      return
    }
    add({ kind, species: s, count: count.trim(), notes: notes.trim() })
    setSpecies('')
    setCount('')
    setNotes('')
    setError(null)
  }

  return (
    <Screen>
      <Card>
        <SectionTitle>Record a sighting</SectionTitle>

        <View style={styles.toggleRow}>
          {(['Livestock', 'Wildlife'] as Kind[]).map((option) => {
            const active = kind === option
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => setKind(option)}
                style={[styles.toggle, active && styles.toggleActive]}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                  {option}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <LabeledInput
          label="Species / type"
          placeholder={kind === 'Livestock' ? 'e.g. Angus cattle' : 'e.g. Mule deer'}
          value={species}
          onChangeText={setSpecies}
        />
        <LabeledInput
          label="Count (optional)"
          placeholder="e.g. 24"
          value={count}
          onChangeText={setCount}
          keyboardType="number-pad"
        />
        <LabeledInput
          label="Notes (optional)"
          placeholder="Behavior, health, location..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <PrimaryButton title="Save sighting" onPress={handleAdd} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>Sightings ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>No sightings yet. Record livestock herds or wildlife you spot.</EmptyState>
        ) : (
          items.map((sighting) => (
            <RecordItem
              key={sighting.id}
              emoji={sighting.kind === 'Livestock' ? '🐄' : '🦌'}
              title={sighting.species}
              subtitle={sighting.notes || undefined}
              meta={[sighting.kind, sighting.count ? `${sighting.count} head` : null]
                .filter(Boolean)
                .join(' • ')}
              onRemove={() => remove(sighting.id)}
            />
          ))
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: '#fdfcf9',
  },
  toggleActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  toggleText: { fontWeight: '600', color: colors.muted },
  toggleTextActive: { color: colors.accentStrong },
})
