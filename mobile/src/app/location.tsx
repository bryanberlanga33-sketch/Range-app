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
import { MapFence } from '@/components/MapFence'
import type { GeoPoint } from '@/components/map/types'
import { BaseRecord, useCollection } from '@/store/useCollection'
import { colors } from '@/theme'

interface LocationRecord extends BaseRecord {
  name: string
  notes: string
  points: GeoPoint[]
  /** Legacy free-text coordinates from earlier app versions. */
  coordinates?: string
}

export default function LocationScreen() {
  const { items, add, remove } = useCollection<LocationRecord>('locations')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [points, setPoints] = useState<GeoPoint[]>([])
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const n = name.trim()
    if (!n) {
      setError('Please name the location.')
      return
    }
    add({ name: n, notes: notes.trim(), points })
    setName('')
    setNotes('')
    setPoints([])
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

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted }}>
            Property fence
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
            Tap the map to outline the pasture or property. Points connect into a
            polygon you can reuse for point mapping.
          </Text>
        </View>

        <MapFence points={points} onChange={setPoints} />

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
          items.map((loc) => {
            const pts = loc.points ?? []
            const fenceMeta =
              pts.length > 0
                ? `${pts.length} boundary point${pts.length === 1 ? '' : 's'}${
                    pts.length >= 3 ? ' · polygon' : ''
                  }`
                : loc.coordinates || undefined
            return (
              <RecordItem
                key={loc.id}
                emoji="📍"
                title={loc.name}
                subtitle={loc.notes || undefined}
                meta={fenceMeta}
                onRemove={() => remove(loc.id)}
              />
            )
          })
        )}
      </View>
    </Screen>
  )
}
