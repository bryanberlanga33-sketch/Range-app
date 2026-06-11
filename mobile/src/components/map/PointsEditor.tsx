import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '@/theme'
import type { GeoPoint } from './types'

interface PointsEditorProps {
  points: GeoPoint[]
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}

function fmt(n: number): string {
  return n.toFixed(5)
}

export function PointsEditor({
  points,
  onRename,
  onRemove,
  onClear,
}: PointsEditorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>
          Boundary points ({points.length})
        </Text>
        {points.length > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={onClear}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {points.length === 0 ? (
        <Text style={styles.hint}>
          Tap the map to drop boundary points. Three or more points form the
          property fence. You can rename each point below.
        </Text>
      ) : (
        <View style={styles.list}>
          {points.map((point, index) => (
            <View key={point.id} style={styles.pointRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>
              <View style={styles.pointBody}>
                <TextInput
                  style={styles.nameInput}
                  value={point.name}
                  onChangeText={(text) => onRename(point.id, text)}
                  placeholder={`Point ${index + 1}`}
                  placeholderTextColor={colors.muted}
                />
                <Text style={styles.coords}>
                  {fmt(point.lat)}, {fmt(point.lng)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${point.name}`}
                onPress={() => onRemove(point.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { fontSize: 14, fontWeight: '700', color: colors.text },
  clearButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearText: { color: colors.danger, fontWeight: '600', fontSize: 12 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  list: { gap: spacing.sm },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  pointBody: { flex: 1 },
  nameInput: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 2,
  },
  coords: { fontSize: 12, color: colors.muted },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
  },
  removeText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
})
