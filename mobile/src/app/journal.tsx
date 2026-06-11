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

interface JournalEntry extends BaseRecord {
  title: string
  conditions: string
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function JournalScreen() {
  const { items, add, remove } = useCollection<JournalEntry>('journal-entries')
  const [title, setTitle] = useState('')
  const [conditions, setConditions] = useState('')
  const [error, setError] = useState<string | null>(null)

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
    add({ title: t, conditions: c })
    setTitle('')
    setConditions('')
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
        {error && <ErrorText>{error}</ErrorText>}
        <PrimaryButton title="Save entry" onPress={handleAdd} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>Entries ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>No entries yet. Log your first rangeland observation above.</EmptyState>
        ) : (
          items.map((entry) => (
            <RecordItem
              key={entry.id}
              emoji="📓"
              title={entry.title}
              subtitle={entry.conditions}
              meta={formatDate(entry.createdAt)}
              onRemove={() => remove(entry.id)}
            />
          ))
        )}
      </View>
    </Screen>
  )
}
