import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Badge, Card, EmptyState, Screen, SectionTitle } from '@/components/ui'
import { PlantIdentifier } from '@/components/PlantIdentifier'
import { PlantImage } from '@/components/PlantImage'
import { categoryBadge, forageBadge } from '@/components/plantBadges'
import { useCollection } from '@/store/useCollection'
import type { PlantRecord } from '@/models'
import type { PlantSpecies } from '@/data/plantCatalog'
import { colors, spacing } from '@/theme'

export default function PlantsScreen() {
  const { items, add, remove } = useCollection<PlantRecord>('plant-species')

  const addedIds = useMemo(
    () => items.map((p) => p.speciesId).filter((id): id is string => !!id),
    [items],
  )

  function addSpecies(species: PlantSpecies) {
    if (species.id && addedIds.includes(species.id)) return
    add({
      speciesId: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      category: species.category,
      forageValue: species.forageValue,
      description: species.description,
      imageUrl: species.imageUrl,
    })
  }

  return (
    <Screen>
      <Card>
        <SectionTitle>Identify a plant</SectionTitle>
        <Text style={styles.intro}>
          Search the rangeland species catalog, then add a match. Each plant is
          categorized as a grass, forb, or brush species and rated for forage value.
        </Text>
        <PlantIdentifier addedIds={addedIds} onAdd={addSpecies} />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle>My plants ({items.length})</SectionTitle>
        {items.length === 0 ? (
          <EmptyState>
            No plants yet. Use the identifier above to add species you find on the range.
          </EmptyState>
        ) : (
          items.map((plant) => {
            const cat = categoryBadge(plant.category)
            const forage = forageBadge(plant.forageValue)
            return (
              <View key={plant.id} style={styles.card}>
                <PlantImage
                  uri={plant.imageUrl}
                  category={plant.category}
                  size={72}
                />
                <View style={styles.body}>
                  <Text style={styles.commonName}>{plant.commonName}</Text>
                  {!!plant.scientificName && (
                    <Text style={styles.sciName}>{plant.scientificName}</Text>
                  )}
                  <View style={styles.badges}>
                    <Badge
                      label={plant.category}
                      color={cat.color}
                      background={cat.background}
                    />
                    <Badge
                      label={`Forage: ${plant.forageValue}`}
                      color={forage.color}
                      background={forage.background}
                    />
                  </View>
                  {!!plant.description && (
                    <Text style={styles.desc}>{plant.description}</Text>
                  )}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${plant.commonName}`}
                  onPress={() => remove(plant.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            )
          })
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  body: { flex: 1, gap: 4 },
  commonName: { fontSize: 16, fontWeight: '700', color: colors.text },
  sciName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.muted,
    marginTop: -2,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 },
  desc: { fontSize: 13, color: colors.text, lineHeight: 18, marginTop: 2 },
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
