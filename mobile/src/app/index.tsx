import { Link } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@/theme'

interface NavItem {
  href: '/journal' | '/location' | '/plants' | '/wildlife'
  emoji: string
  title: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/journal',
    emoji: '📓',
    title: 'Journal Entries',
    description: 'Log daily rangeland conditions, weather, and observations.',
  },
  {
    href: '/location',
    emoji: '📍',
    title: 'Locations',
    description: 'Record pastures, paddocks, and points of interest.',
  },
  {
    href: '/plants',
    emoji: '🌿',
    title: 'Plant Species',
    description: 'Track grasses, forbs, and shrubs found across the range.',
  },
  {
    href: '/wildlife',
    emoji: '🐄',
    title: 'Livestock & Wildlife',
    description: 'Note herds, counts, and wildlife sightings.',
  },
]

export default function Landing() {
  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🌾</Text>
          <Text style={styles.title}>Rangeland Journal</Text>
          <Text style={styles.subtitle}>
            Keep a field record of conditions across your property.
          </Text>
        </View>

        <View style={styles.grid}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                accessibilityRole="link"
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  heroEmoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 360,
  },
  grid: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
  },
  cardPressed: { backgroundColor: colors.accentSoft },
  cardEmoji: { fontSize: 30 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardDescription: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 28, color: colors.muted, fontWeight: '300' },
})
