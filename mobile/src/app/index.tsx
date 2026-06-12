import { Link } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PastureLive } from '@/components/PastureLive'
import { colors, spacing } from '@/theme'

interface NavItem {
  href: '/journal' | '/location' | '/plants' | '/wildlife'
  emoji: string
  title: string
  description: string
  tone: string
  height: number
}

// Staggered two-column layout (column-major) for a masonry feel.
const COLUMNS: NavItem[][] = [
  [
    {
      href: '/journal',
      emoji: '📓',
      title: 'Journal Entries',
      description: 'Log daily conditions & observations',
      tone: '#2f4a37',
      height: 176,
    },
    {
      href: '/plants',
      emoji: '🌿',
      title: 'Plant Species',
      description: 'Identify grasses, forbs & brush',
      tone: '#6c7a55',
      height: 212,
    },
  ],
  [
    {
      href: '/location',
      emoji: '📍',
      title: 'Locations',
      description: 'Map pastures & property fences',
      tone: '#54664c',
      height: 212,
    },
    {
      href: '/wildlife',
      emoji: '🐄',
      title: 'Livestock & Wildlife',
      description: 'Herds, rotations & sightings',
      tone: '#3a4f3e',
      height: 176,
    },
  ],
]

function NavCard({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: item.tone, height: item.height },
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <View style={styles.flex} />
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </Pressable>
    </Link>
  )
}

export default function Landing() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>RANGELAND JOURNAL</Text>
          <Text style={styles.title}>Find your{'\n'}path</Text>
          <Text style={styles.subtitle}>
            Track conditions across your property.
          </Text>
        </View>

        <View style={styles.grid}>
          {COLUMNS.map((column, i) => (
            <View key={i} style={styles.column}>
              {column.map((item) => (
                <NavCard key={item.href} item={item} />
              ))}
            </View>
          ))}
        </View>

        <PastureLive />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  header: { gap: spacing.xs },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.muted,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 38,
  },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: spacing.xs },
  grid: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.md },
  card: {
    borderRadius: 20,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 34, position: 'absolute', top: spacing.lg, left: spacing.lg },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    lineHeight: 16,
  },
})
