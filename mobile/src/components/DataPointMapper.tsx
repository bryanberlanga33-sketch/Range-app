import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { MapCanvas } from './map/MapCanvas'
import { makeId, pointInPolygon } from './map/geo'
import type { DataPoint, LatLng } from './map/types'

interface DataPointMapperProps {
  boundary: LatLng[]
  dataPoints: DataPoint[]
  onChange: (dataPoints: DataPoint[]) => void
}

function fmt(n: number): string {
  return n.toFixed(5)
}

export function DataPointMapper({
  boundary,
  dataPoints,
  onChange,
}: DataPointMapperProps) {
  const [warning, setWarning] = useState<string | null>(null)

  function addPoint(lat: number, lng: number) {
    if (boundary.length >= 3 && !pointInPolygon(lat, lng, boundary)) {
      setWarning('Tap inside the selected polygon to drop a data point.')
      return
    }
    setWarning(null)
    onChange([
      ...dataPoints,
      { id: makeId(), label: `Data point ${dataPoints.length + 1}`, lat, lng },
    ])
  }
  function renamePoint(id: string, label: string) {
    onChange(dataPoints.map((p) => (p.id === id ? { ...p, label } : p)))
  }
  function removePoint(id: string) {
    onChange(dataPoints.filter((p) => p.id !== id))
  }

  return (
    <View style={styles.container}>
      <MapCanvas
        polygon={boundary}
        dataPoints={dataPoints}
        onMapPress={addPoint}
        height={300}
      />

      {warning && <Text style={styles.warning}>{warning}</Text>}

      <Text style={styles.heading}>Data points ({dataPoints.length})</Text>
      {dataPoints.length === 0 ? (
        <Text style={styles.hint}>
          Tap inside the polygon to add a data point (e.g. water trough, bare
          ground, weed cluster). You can label each one below.
        </Text>
      ) : (
        <View style={styles.list}>
          {dataPoints.map((point, index) => (
            <View key={point.id} style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>
              <View style={styles.body}>
                <TextInput
                  style={styles.labelInput}
                  value={point.label}
                  onChangeText={(text) => renamePoint(point.id, text)}
                  placeholder={`Data point ${index + 1}`}
                  placeholderTextColor={colors.muted}
                />
                <Text style={styles.coords}>
                  {fmt(point.lat)}, {fmt(point.lng)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${point.label}`}
                onPress={() => removePoint(point.id)}
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
  container: { gap: spacing.md },
  warning: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  heading: { fontSize: 14, fontWeight: '700', color: colors.text },
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
    padding: spacing.sm,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  body: { flex: 1 },
  labelInput: {
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
