import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Badge } from './ui'
import { forageBadge } from './plantBadges'
import { analyzePlants } from '@/lib/pastureTrends'
import type { PlantRecord } from '@/models'
import type { ForageValue } from '@/data/plantCatalog'
import { colors, spacing } from '@/theme'

const ORDER: ForageValue[] = ['Great', 'Good', 'Fair', 'Bad']

export function PlantComposition({ plants }: { plants: PlantRecord[] }) {
  const comp = useMemo(() => analyzePlants(plants), [plants])
  if (plants.length === 0) return null

  return (
    <View style={styles.block}>
      <Text style={styles.blockHead}>🌱 Improving plant composition</Text>

      <View style={styles.counts}>
        {ORDER.map((value) => {
          const n = comp.counts[value]
          if (n === 0) return null
          const c = forageBadge(value)
          return (
            <Badge
              key={value}
              label={`${value} ${n}`}
              color={c.color}
              background={c.background}
            />
          )
        })}
      </View>

      <View style={styles.tips}>
        {comp.suggestions.map((tip, i) => (
          <Text key={i} style={styles.tip}>
            • {tip}
          </Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  blockHead: { fontSize: 14, fontWeight: '700', color: colors.accentStrong },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tips: { gap: 3, marginTop: 2 },
  tip: { fontSize: 12, color: colors.text, lineHeight: 17 },
})
