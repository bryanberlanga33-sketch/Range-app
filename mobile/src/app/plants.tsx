import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Badge, Card, EmptyState, Screen, SectionTitle } from '@/components/ui'
import { PlantIdentifier } from '@/components/PlantIdentifier'
import { PlantImage } from '@/components/PlantImage'
import { PolygonSelector } from '@/components/PolygonSelector'
import { categoryBadge, forageBadge } from '@/components/plantBadges'
import { useCollection } from '@/store/useCollection'
import type { LocationRecord, PlantRecord } from '@/models'
import type { PlantSpecies } from '@/data/plantCatalog'
import { colors, spacing } from '@/theme'

export default function PlantsScreen() {
  const { items, add, remove } = useCollection<PlantRecord>('plant-species')
  const { items: locations } = useCollection<LocationRecord>('locations')

  const [pastureId, setPastureId] = useState<string | null>(null)

  // "Added" state is per pasture context, so a species can be recorded in more
  // than one pasture.
  const addedIds = useMemo(
    () =>
      items
        .filter((p) => (p.pastureId ?? null) === pastureId)
        .map((p) => p.speciesId)
        .filter((id): id is string => !!id),
    [items, pastureId],
  )

  function addSpecies(species: PlantSpecies) {
    if (species.id && addedIds.includes(species.id)) return
    const pasture = locations.find((l) => l.id === pastureId)
    add({
      speciesId: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      category: species.category,
      forageValue: species.forageValue,
      description: species.description,
      imageUrl: species.imageUrl,
      pastureId: pasture?.id,
      pastureName: pasture?.name,
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
        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Found in pasture (optional)</Text>
          <PolygonSelector
            polygons={locations}
            selectedId={pastureId}
            onSelect={setPastureId}
            emptyHint="No polygons yet — create a pasture under Locations to tag plants by pasture."
          />
        </View>
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
                  {!!plant.pastureName && (
                    <Text style={styles.pasture}>📍 {plant.pastureName}</Text>
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
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  pasture: { fontSize: 12, color: colors.accentStrong, fontWeight: '600', marginTop: 2 },
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
