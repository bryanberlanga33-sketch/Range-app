import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Badge } from './ui'
import { categoryBadge, forageBadge } from './plantBadges'
import { useCollection } from '@/store/useCollection'
import {
  locationVertices,
  type Herd,
  type JournalEntry,
  type LocationRecord,
  type PlantRecord,
  type WildlifeSighting,
} from '@/models'
import { colors, spacing } from '@/theme'

interface PastureSummary {
  id: string | null
  name: string
  vertices: number
  herds: Herd[]
  totalHead: number
  rotationHerds: number
  plants: PlantRecord[]
  journals: JournalEntry[]
  dataPoints: number
  photos: string[]
  sightings: WildlifeSighting[]
}

function summarize(
  id: string | null,
  name: string,
  vertices: number,
  herds: Herd[],
  plants: PlantRecord[],
  journals: JournalEntry[],
  sightings: WildlifeSighting[],
): PastureSummary {
  return {
    id,
    name,
    vertices,
    herds,
    totalHead: herds.reduce((sum, h) => sum + (h.headCount || 0), 0),
    rotationHerds: herds.filter((h) => h.onRotation).length,
    plants,
    journals,
    dataPoints: journals.reduce((sum, j) => sum + (j.dataPoints?.length ?? 0), 0),
    photos: journals.map((j) => j.photoUri).filter((u): u is string => !!u),
    sightings,
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function PastureLive() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { items: locations } = useCollection<LocationRecord>('locations')
  const { items: journals } = useCollection<JournalEntry>('journal-entries')
  const { items: plants } = useCollection<PlantRecord>('plant-species')
  const { items: herds } = useCollection<Herd>('livestock-herds')
  const { items: sightings } = useCollection<WildlifeSighting>('wildlife-sightings')

  const summaries = useMemo<PastureSummary[]>(() => {
    const result = locations.map((loc) =>
      summarize(
        loc.id,
        loc.name,
        locationVertices(loc).length,
        herds.filter((h) => h.pastureId === loc.id),
        plants.filter((p) => p.pastureId === loc.id),
        journals.filter((j) => j.locationId === loc.id),
        sightings.filter((s) => s.pastureId === loc.id),
      ),
    )

    const orphanHerds = herds.filter((h) => !h.pastureId)
    const orphanPlants = plants.filter((p) => !p.pastureId)
    const orphanJournals = journals.filter((j) => !j.locationId)
    const orphanSightings = sightings.filter((s) => !s.pastureId)
    if (
      orphanHerds.length ||
      orphanPlants.length ||
      orphanJournals.length ||
      orphanSightings.length
    ) {
      result.push(
        summarize(
          null,
          'Unassigned (no pasture)',
          0,
          orphanHerds,
          orphanPlants,
          orphanJournals,
          orphanSightings,
        ),
      )
    }
    return result
  }, [locations, journals, plants, herds, sightings])

  return (
    <View style={styles.section}>
      <Text style={styles.title}>📊 My Pasture Live</Text>
      <Text style={styles.subtitle}>
        A live breakdown of each pasture — journals, plants, livestock, and wildlife
        in one place.
      </Text>

      {summaries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Add a pasture under Locations, then log journals, plants, and livestock to
            see the breakdown here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {summaries.map((s) => {
            const key = s.id ?? 'unassigned'
            return (
              <PastureSheet
                key={key}
                summary={s}
                expanded={selectedKey === key}
                onToggle={() =>
                  setSelectedKey((prev) => (prev === key ? null : key))
                }
              />
            )
          })}
        </View>
      )}
    </View>
  )
}

function recordCount(s: PastureSummary) {
  return s.herds.length + s.plants.length + s.journals.length + s.sightings.length
}

function PastureSheet({
  summary: s,
  expanded,
  onToggle,
}: {
  summary: PastureSummary
  expanded: boolean
  onToggle: () => void
}) {
  const isEmpty =
    s.herds.length === 0 &&
    s.plants.length === 0 &&
    s.journals.length === 0 &&
    s.sightings.length === 0
  const latestJournal = s.journals[0]
  const count = recordCount(s)

  return (
    <View style={[styles.sheet, expanded && styles.sheetExpanded]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${s.name}, ${count} record${count === 1 ? '' : 's'}`}
        onPress={onToggle}
        style={({ pressed }) => [styles.sheetHeader, pressed && styles.sheetHeaderPressed]}
      >
        <Text style={styles.sheetName} numberOfLines={1}>
          🌿 {s.name}
        </Text>
        <View style={styles.headerMeta}>
          <Text style={styles.countPill}>{count}</Text>
          <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
        </View>
      </Pressable>

      {!expanded ? null : (
        <View style={styles.sheetBody}>
          {s.id && (
            <Text style={styles.sheetFence}>
              {s.vertices >= 3 ? `${s.vertices}-point fence` : 'no fence drawn'}
            </Text>
          )}
          {isEmpty ? (
            <Text style={styles.muted}>No records yet for this pasture.</Text>
          ) : (
            <>
              {/* Livestock */}
          {s.herds.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockHead}>
                🐄 Livestock — {s.totalHead} head across {s.herds.length} herd
                {s.herds.length === 1 ? '' : 's'}
                {s.rotationHerds > 0 ? ` · ${s.rotationHerds} on rotation` : ''}
              </Text>
              {s.herds.map((h) => (
                <Text key={h.id} style={styles.line}>
                  • {h.name} — {h.headCount} {h.species}
                  {h.animals.length > 0 ? ` (${h.animals.length} tagged)` : ''}
                  {h.onRotation ? ' · 🔁 rotation' : ''}
                </Text>
              ))}
            </View>
          )}

          {/* Plants */}
          {s.plants.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockHead}>
                🌱 Plants — {s.plants.length} species
              </Text>
              {s.plants.map((p) => {
                const cat = categoryBadge(p.category)
                const forage = forageBadge(p.forageValue)
                return (
                  <View key={p.id} style={styles.plantLine}>
                    <Text style={styles.line}>• {p.commonName}</Text>
                    <Badge label={p.category} color={cat.color} background={cat.background} />
                    <Badge
                      label={p.forageValue}
                      color={forage.color}
                      background={forage.background}
                    />
                  </View>
                )
              })}
            </View>
          )}

          {/* Journal */}
          {s.journals.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockHead}>
                📓 Journal — {s.journals.length} entr
                {s.journals.length === 1 ? 'y' : 'ies'}
                {s.dataPoints > 0 ? ` · ${s.dataPoints} mapped points` : ''}
              </Text>
              {latestJournal && (
                <Text style={styles.line}>
                  • Latest: “{latestJournal.title}” ({formatDate(latestJournal.createdAt)}) —{' '}
                  {latestJournal.conditions}
                </Text>
              )}
              {s.photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoStrip}
                  contentContainerStyle={styles.photoStripContent}
                >
                  {s.photos.map((uri, i) => (
                    <Image key={`${uri}-${i}`} source={{ uri }} style={styles.photo} />
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Wildlife */}
          {s.sightings.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockHead}>
                🦌 Wildlife — {s.sightings.length} sighting
                {s.sightings.length === 1 ? '' : 's'}
              </Text>
              {s.sightings.map((w) => (
                <Text key={w.id} style={styles.line}>
                  • {w.species}
                  {w.count ? ` (${w.count})` : ''} — seen {formatDate(w.createdAt)}
                </Text>
              ))}
            </View>
          )}
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  empty: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: spacing.lg,
  },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  list: { gap: spacing.sm },
  sheet: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sheetExpanded: {
    borderColor: colors.accent,
    paddingBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sheetHeaderPressed: { opacity: 0.6 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countPill: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentStrong,
    backgroundColor: colors.accentSoft,
    minWidth: 22,
    textAlign: 'center',
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  chevron: { fontSize: 14, color: colors.muted, fontWeight: '700' },
  sheetBody: { gap: spacing.sm },
  sheetName: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  sheetFence: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  muted: { fontSize: 13, color: colors.muted },
  block: {
    gap: 3,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  blockHead: { fontSize: 14, fontWeight: '700', color: colors.accentStrong },
  line: { fontSize: 13, color: colors.text, lineHeight: 19 },
  plantLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  photoStrip: { marginTop: spacing.xs },
  photoStripContent: { gap: spacing.sm },
  photo: { width: 96, height: 96, borderRadius: 10, backgroundColor: colors.accentSoft },
})
