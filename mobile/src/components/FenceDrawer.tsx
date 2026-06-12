import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { MapCanvas } from './map/MapCanvas'
import type { LatLng } from './map/types'

interface FenceDrawerProps {
  vertices: LatLng[]
  onChange: (vertices: LatLng[]) => void
}

function fmt(n: number): string {
  return n.toFixed(5)
}

export function FenceDrawer({ vertices, onChange }: FenceDrawerProps) {
  function addVertex(lat: number, lng: number) {
    onChange([...vertices, { lat, lng }])
  }
  function removeVertex(index: number) {
    onChange(vertices.filter((_, i) => i !== index))
  }
  function clear() {
    onChange([])
  }

  return (
    <View style={styles.container}>
      <MapCanvas
        polygon={vertices}
        vertices={vertices}
        onMapPress={addVertex}
        height={320}
      />

      <View style={styles.headerRow}>
        <Text style={styles.heading}>Boundary points ({vertices.length})</Text>
        {vertices.length > 0 && (
          <Pressable accessibilityRole="button" onPress={clear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {vertices.length === 0 ? (
        <Text style={styles.hint}>
          Tap the map to drop guide points that outline the pasture. Three or more
          points form the property fence polygon.
        </Text>
      ) : (
        <>
          {vertices.length < 3 && (
            <Text style={styles.hint}>
              Add {3 - vertices.length} more point
              {3 - vertices.length === 1 ? '' : 's'} to close the polygon.
            </Text>
          )}
          <View style={styles.list}>
            {vertices.map((v, index) => (
              <View key={`${v.lat},${v.lng},${index}`} style={styles.row}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.coords}>
                  {fmt(v.lat)}, {fmt(v.lng)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove point ${index + 1}`}
                  onPress={() => removeVertex(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  coords: { flex: 1, fontSize: 13, color: colors.muted },
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
