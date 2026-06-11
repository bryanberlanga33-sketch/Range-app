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

interface LocationRecord extends BaseRecord {
  name: string
  coordinates: string
  notes: string
}

export default function LocationScreen() {
  const { items, add, remove } = useCollection<LocationRecord>('locations')
  const [name, setName] = useState('')
  const [coordinates, setCoordinates] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const n = name.trim()
    if (!n) {
      setError('Please name the location.')
      return
    }
    add({ name: n, coordinates: coordinates.trim(), notes: notes.trim() })
    setName('')
    setCoordinates('')
    setNotes('')
    setError(null)
  }

  return (
    <Screen>
      <Card>
        <SectionTitle>New location</SectionTitle>
        <LabeledInput
          label="Name"
          placeholder="e.g. Cedar Ridge Paddock"
          value={name}
          onChangeText={setName}
        />
        <LabeledInput
          label="Coordinates (optional)"
          placeholder="e.g. 44.8321, -108.7426"
          value={coordinates}
          onChangeText={setCoordinates}
        />
        <LabeledInput
          label="Notes (optional)"
          placeholder="Water access, fencing, terrain..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <PrimaryButton title="Save location" onPress={handleAdd} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>Locations ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>No locations yet. Add a pasture, paddock, or point of interest.</EmptyState>
        ) : (
          items.map((loc) => (
            <RecordItem
              key={loc.id}
              emoji="📍"
              title={loc.name}
              subtitle={loc.notes || undefined}
              meta={loc.coordinates || undefined}
              onRemove={() => remove(loc.id)}
            />
          ))
        )}
      </View>
    </Screen>
  )
}
