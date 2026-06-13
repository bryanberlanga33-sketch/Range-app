import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { usePastureSummaries, type PastureSummary } from './PastureLive'
import { useCollection } from '@/store/useCollection'
import type { PastureGroup } from '@/models'
import {
  estimateCarryingCapacity,
  herdAnimalUnits,
  summarizeSamples,
} from '@/lib/carryingCapacity'
import { colors, spacing } from '@/theme'

type Kind = PastureGroup['kind']

function round(n: number, digits = 0): string {
  const f = Math.pow(10, digits)
  return (Math.round(n * f) / f).toLocaleString(undefined, {
    maximumFractionDigits: digits,
  })
}

/** Carrying-capacity AUMs available for a single pasture, from its frame data. */
function pastureAums(s: PastureSummary): number {
  const points = s.journals.flatMap((j) => j.dataPoints ?? [])
  const result = estimateCarryingCapacity({
    areaAcres: s.areaAcres,
    summary: summarizeSamples(points),
    useFactorPct: 25,
    grazingDays: 30,
    herdAU: herdAnimalUnits(s.herds),
  })
  return result.computable ? result.aums ?? 0 : 0
}

interface Aggregate {
  acres: number
  herds: number
  head: number
  au: number
  aums: number
  months?: number
}

function aggregate(members: PastureSummary[]): Aggregate {
  let acres = 0
  let herds = 0
  let head = 0
  let au = 0
  let aums = 0
  members.forEach((s) => {
    acres += s.areaAcres
    herds += s.herds.length
    s.herds.forEach((h) => (head += h.headCount || 0))
    au += herdAnimalUnits(s.herds)
    aums += pastureAums(s)
  })
  return { acres, herds, head, au, aums, months: au > 0 ? aums / au : undefined }
}

export function PastureCollections() {
  const summaries = usePastureSummaries()
  const {
    items: groups,
    add,
    remove,
    update,
  } = useCollection<PastureGroup>('pasture-groups')

  const pastures = useMemo(
    () => summaries.filter((s): s is PastureSummary & { id: string } => !!s.id),
    [summaries],
  )
  const byId = useMemo(() => {
    const map: Record<string, PastureSummary & { id: string }> = {}
    pastures.forEach((p) => {
      map[p.id] = p
    })
    return map
  }, [pastures])

  const [name, setName] = useState('')
  const [kind, setKind] = useState<Kind>('rotation')
  const [picked, setPicked] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function togglePick(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  function createGroup() {
    const n = name.trim()
    if (!n) {
      setError('Name the collection.')
      return
    }
    if (picked.length < 2) {
      setError('Pick at least two pastures to group together.')
      return
    }
    add({ name: n, kind, pastureIds: picked })
    setName('')
    setPicked([])
    setKind('rotation')
    setError(null)
  }

  function addMember(group: PastureGroup, id: string) {
    if (group.pastureIds.includes(id)) return
    update(group.id, { pastureIds: [...group.pastureIds, id] })
  }
  function removeMember(group: PastureGroup, id: string) {
    update(group.id, {
      pastureIds: group.pastureIds.filter((p) => p !== id),
    })
  }
  function move(group: PastureGroup, index: number, dir: -1 | 1) {
    const next = [...group.pastureIds]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    update(group.id, { pastureIds: next })
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>🧩 Pasture collections</Text>
      <Text style={styles.subtitle}>
        Group pastures into a rotational-grazing plan (ordered) or a property
        group, and see the combined acreage, herd, and forage capacity.
      </Text>

      {/* Create */}
      <View style={styles.createCard}>
        <Text style={styles.fieldLabel}>Collection name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Summer rotation, Home place"
          placeholderTextColor={colors.muted}
        />

        <View style={styles.kindRow}>
          {(
            [
              ['rotation', '🔁 Rotational grazing'],
              ['property', '🏡 Property group'],
            ] as [Kind, string][]
          ).map(([k, label]) => {
            const active = kind === k
            return (
              <Pressable
                key={k}
                accessibilityRole="button"
                onPress={() => setKind(k)}
                style={[styles.kindBtn, active && styles.kindBtnActive]}
              >
                <Text style={[styles.kindBtnText, active && styles.kindBtnTextActive]}>
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {pastures.length === 0 ? (
          <Text style={styles.hint}>
            Add pastures under Locations first, then group them here.
          </Text>
        ) : (
          <>
            <Text style={styles.fieldLabel}>
              {kind === 'rotation'
                ? 'Pick pastures in rotation order'
                : 'Pick pastures to group'}
            </Text>
            <View style={styles.chips}>
              {pastures.map((p) => {
                const idx = picked.indexOf(p.id)
                const active = idx >= 0
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    onPress={() => togglePick(p.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {active && kind === 'rotation' ? `${idx + 1}. ` : ''}
                      {p.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          accessibilityRole="button"
          onPress={createGroup}
          style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
        >
          <Text style={styles.createBtnText}>Create collection</Text>
        </Pressable>
      </View>

      {/* Existing groups */}
      {groups.length > 0 && (
        <View style={styles.list}>
          {groups.map((group) => {
            const members = group.pastureIds
              .map((id) => byId[id])
              .filter((m): m is PastureSummary & { id: string } => !!m)
            const agg = aggregate(members)
            const nonMembers = pastures.filter(
              (p) => !group.pastureIds.includes(p.id),
            )
            const isRotation = group.kind === 'rotation'
            return (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {isRotation ? '🔁' : '🏡'} {group.name}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${group.name}`}
                    onPress={() => remove(group.id)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </Pressable>
                </View>
                <Text style={styles.kindTag}>
                  {isRotation ? 'Rotational grazing' : 'Property group'} ·{' '}
                  {members.length} pasture{members.length === 1 ? '' : 's'}
                </Text>

                {isRotation && members.length > 1 && (
                  <Text style={styles.sequence}>
                    {members.map((m) => m.name).join('  →  ')}
                  </Text>
                )}

                <View style={styles.aggRow}>
                  <Text style={styles.aggText}>📐 {round(agg.acres, 1)} ac</Text>
                  <Text style={styles.aggText}>🐄 {round(agg.head)} head · {round(agg.au, 1)} AU</Text>
                  {agg.aums > 0 && (
                    <Text style={styles.aggText}>🌾 {round(agg.aums, 1)} AUMs</Text>
                  )}
                </View>
                {agg.aums > 0 && agg.months !== undefined && (
                  <Text style={styles.aggMonths}>
                    Combined forage supports about {round(agg.months, 1)} month
                    {round(agg.months, 1) === '1' ? '' : 's'} of grazing for the{' '}
                    {round(agg.au, 1)} AU in this collection.
                  </Text>
                )}

                {/* Members */}
                <View style={styles.members}>
                  {members.map((m, i) => (
                    <View key={m.id} style={styles.memberRow}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {isRotation ? `${i + 1}. ` : '• '}
                        {m.name}
                        <Text style={styles.memberMeta}>  {round(m.areaAcres, 1)} ac</Text>
                      </Text>
                      <View style={styles.memberActions}>
                        {isRotation && (
                          <>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Move ${m.name} up`}
                              onPress={() => move(group, i, -1)}
                              style={styles.iconBtn}
                            >
                              <Text style={styles.iconBtnText}>▲</Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Move ${m.name} down`}
                              onPress={() => move(group, i, 1)}
                              style={styles.iconBtn}
                            >
                              <Text style={styles.iconBtnText}>▼</Text>
                            </Pressable>
                          </>
                        )}
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${m.name} from ${group.name}`}
                          onPress={() => removeMember(group, m.id)}
                          style={styles.iconBtn}
                        >
                          <Text style={styles.iconBtnText}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>

                {nonMembers.length > 0 && (
                  <View style={styles.addRow}>
                    <Text style={styles.addLabel}>Add:</Text>
                    {nonMembers.map((p) => (
                      <Pressable
                        key={p.id}
                        accessibilityRole="button"
                        onPress={() => addMember(group, p.id)}
                        style={styles.addChip}
                      >
                        <Text style={styles.addChipText}>+ {p.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  createCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fdfcf9',
  },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  kindRow: { flexDirection: 'row', gap: spacing.sm },
  kindBtn: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#fdfcf9',
  },
  kindBtnActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  kindBtnText: { fontWeight: '600', color: colors.muted, fontSize: 13 },
  kindBtnTextActive: { color: colors.accentStrong },
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
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  createBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  createBtnPressed: { backgroundColor: colors.accentStrong },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { gap: spacing.sm },
  groupCard: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  groupName: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text },
  deleteBtn: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  kindTag: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  sequence: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentStrong,
    lineHeight: 19,
  },
  aggRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  aggText: { fontSize: 13, fontWeight: '700', color: colors.text },
  aggMonths: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  members: {
    gap: spacing.xs,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  memberName: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  memberMeta: { fontSize: 12, color: colors.muted, fontWeight: '400' },
  memberActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: '#fdfcf9',
  },
  iconBtnText: { fontSize: 13, color: colors.muted, fontWeight: '700' },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  addLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  addChip: {
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.accentSoft,
  },
  addChipText: { color: colors.accentStrong, fontWeight: '600', fontSize: 12 },
})
