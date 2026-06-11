import { useState } from 'react'
import { Text, View } from 'react-native'
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
import { FenceDrawer } from '@/components/FenceDrawer'
import type { LatLng } from '@/components/map/types'
import { useCollection } from '@/store/useCollection'
import { locationVertices, type LocationRecord } from '@/models'
import { colors } from '@/theme'

export default function LocationScreen() {
  const { items, add, remove } = useCollection<LocationRecord>('locations')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [vertices, setVertices] = useState<LatLng[]>([])
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const n = name.trim()
    if (!n) {
      setError('Please name the polygon (pasture or property).')
      return
    }
    if (vertices.length < 3) {
      setError('Add at least 3 boundary points to form the polygon.')
      return
    }
    add({ name: n, notes: notes.trim(), vertices })
    setName('')
    setNotes('')
    setVertices([])
    setError(null)
  }

  return (
    <Screen>
      <Card>
        <SectionTitle>New property polygon</SectionTitle>
        <LabeledInput
          label="Polygon name"
          placeholder="e.g. Cedar Ridge Pasture"
          value={name}
          onChangeText={setName}
        />

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted }}>
            Property fence
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
            Tap the map to drop guide points that outline the pasture or property.
            The points connect into a named polygon you can select in journal entries.
          </Text>
        </View>

        <FenceDrawer vertices={vertices} onChange={setVertices} />

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
        <PrimaryButton title="Save polygon" onPress={handleAdd} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>Polygons ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>
            No polygons yet. Outline a pasture or property on the map and name it.
          </EmptyState>
        ) : (
          items.map((loc) => {
            const count = locationVertices(loc).length
            const meta =
              count > 0
                ? `${count} boundary point${count === 1 ? '' : 's'}${
                    count >= 3 ? ' · polygon' : ''
                  }`
                : loc.coordinates || undefined
            return (
              <RecordItem
                key={loc.id}
                emoji="📍"
                title={loc.name}
                subtitle={loc.notes || undefined}
                meta={meta}
                onRemove={() => remove(loc.id)}
              />
            )
          })
        )}
      </View>
    </Screen>
  )
}
