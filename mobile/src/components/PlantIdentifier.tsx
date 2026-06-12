import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '@/theme'
import { Badge } from './ui'
import { PlantImage } from './PlantImage'
import { categoryBadge, forageBadge } from './plantBadges'
import { identifyPlants, type PlantSpecies } from '@/data/plantCatalog'

interface PlantIdentifierProps {
  addedIds: string[]
  onAdd: (species: PlantSpecies) => void
}

export function PlantIdentifier({ addedIds, onAdd }: PlantIdentifierProps) {
  const [query, setQuery] = useState('')
  const matches = useMemo(() => identifyPlants(query), [query])

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Describe or name the plant (e.g. sage, clover, blue grama)"
        placeholderTextColor={colors.muted}
        autoCorrect={false}
      />
      <Text style={styles.resultCount}>
        {query.trim()
          ? `${matches.length} match${matches.length === 1 ? '' : 'es'}`
          : `${matches.length} species in catalog`}
      </Text>

      {matches.length === 0 ? (
        <Text style={styles.empty}>
          No matches. Try a common name, a trait, or the category (grass, forb, brush).
        </Text>
      ) : (
        <View style={styles.list}>
          {matches.map((species) => {
            const added = addedIds.includes(species.id)
            const cat = categoryBadge(species.category)
            const forage = forageBadge(species.forageValue)
            return (
              <View key={species.id} style={styles.candidate}>
                <PlantImage
                  uri={species.imageUrl}
                  category={species.category}
                  size={64}
                />
                <View style={styles.body}>
                  <Text style={styles.commonName}>{species.commonName}</Text>
                  <Text style={styles.sciName}>{species.scientificName}</Text>
                  <View style={styles.badges}>
                    <Badge
                      label={species.category}
                      color={cat.color}
                      background={cat.background}
                    />
                    <Badge
                      label={`Forage: ${species.forageValue}`}
                      color={forage.color}
                      background={forage.background}
                    />
                  </View>
                  <Text style={styles.desc} numberOfLines={3}>
                    {species.description}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={added}
                    onPress={() => onAdd(species)}
                    style={[styles.addButton, added && styles.addButtonDisabled]}
                  >
                    <Text
                      style={[styles.addText, added && styles.addTextDisabled]}
                    >
                      {added ? '✓ Added' : '+ Add to my plants'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  search: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fdfcf9',
  },
  resultCount: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  list: { gap: spacing.md },
  candidate: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  body: { flex: 1, gap: 4 },
  commonName: { fontSize: 15, fontWeight: '700', color: colors.text },
  sciName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.muted,
    marginTop: -2,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 },
  desc: { fontSize: 13, color: colors.text, lineHeight: 18, marginTop: 2 },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButtonDisabled: { backgroundColor: colors.accentSoft },
  addText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  addTextDisabled: { color: colors.accentStrong },
})
