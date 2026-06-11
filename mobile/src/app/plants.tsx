import { useState } from 'react'
import { View } from 'react-native'
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

interface PlantRecord extends BaseRecord {
  species: string
  abundance: string
  notes: string
}

export default function PlantsScreen() {
  const { items, add, remove } = useCollection<PlantRecord>('plant-species')
  const [species, setSpecies] = useState('')
  const [abundance, setAbundance] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const s = species.trim()
    if (!s) {
      setError('Please enter the species name.')
      return
    }
    add({ species: s, abundance: abundance.trim(), notes: notes.trim() })
    setSpecies('')
    setAbundance('')
    setNotes('')
    setError(null)
  }

  return (
    <Screen>
      <Card>
        <SectionTitle>Record a plant species</SectionTitle>
        <LabeledInput
          label="Species"
          placeholder="e.g. Western wheatgrass"
          value={species}
          onChangeText={setSpecies}
        />
        <LabeledInput
          label="Abundance (optional)"
          placeholder="e.g. Dominant, Common, Scattered"
          value={abundance}
          onChangeText={setAbundance}
        />
        <LabeledInput
          label="Notes (optional)"
          placeholder="Vigor, grazing pressure, location..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <PrimaryButton title="Save species" onPress={handleAdd} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>Species ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>No species recorded yet. Add grasses, forbs, or shrubs you observe.</EmptyState>
        ) : (
          items.map((plant) => (
            <RecordItem
              key={plant.id}
              emoji="🌿"
              title={plant.species}
              subtitle={plant.notes || undefined}
              meta={plant.abundance || undefined}
              onRemove={() => remove(plant.id)}
            />
          ))
        )}
      </View>
    </Screen>
  )
}
