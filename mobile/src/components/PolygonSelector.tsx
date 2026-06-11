import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { locationVertices, type LocationRecord } from '@/models'

interface PolygonSelectorProps {
  polygons: LocationRecord[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  allowNone?: boolean
  noneLabel?: string
  emptyHint?: string
}

export function PolygonSelector({
  polygons,
  selectedId,
  onSelect,
  allowNone = true,
  noneLabel = 'None',
  emptyHint = 'No polygons yet. Create one under the Locations tab.',
}: PolygonSelectorProps) {
  const usable = polygons.filter((loc) => locationVertices(loc).length >= 3)

  if (usable.length === 0) {
    return <Text style={styles.hint}>{emptyHint}</Text>
  }

  return (
    <View style={styles.chips}>
      {allowNone && (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(null)}
          style={[styles.chip, !selectedId && styles.chipActive]}
        >
          <Text style={[styles.chipText, !selectedId && styles.chipTextActive]}>
            {noneLabel}
          </Text>
        </Pressable>
      )}
      {usable.map((loc) => {
        const active = loc.id === selectedId
        return (
          <Pressable
            key={loc.id}
            accessibilityRole="button"
            onPress={() => onSelect(loc.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              📍 {loc.name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
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
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.accentStrong },
})
