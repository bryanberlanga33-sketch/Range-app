import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@/theme'

const CLY_LOGO = require('../../assets/images/cly-logo-clay.png')

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
  const router = useRouter()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(item.href)}
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
  )
}

export default function Landing() {
  const router = useRouter()
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'CLY'
    }
  }, [])

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image
            source={CLY_LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="CLY"
          />
          <Text style={styles.subtitle}>
            Your rangeland journal — track conditions across the property.
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open My Pasture Live"
          onPress={() => router.push('/pasture-live')}
          style={({ pressed }) => [styles.liveCard, pressed && styles.cardPressed]}
        >
          <Text style={styles.liveEmoji}>📊</Text>
          <View style={styles.flex}>
            <Text style={styles.liveTitle}>My Pasture Live</Text>
            <Text style={styles.liveDescription} numberOfLines={2}>
              Search & browse every pasture’s journals, plants, livestock & wildlife
            </Text>
          </View>
          <Text style={styles.liveArrow}>›</Text>
        </Pressable>
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
  logo: {
    width: 248,
    height: 123,
  },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: spacing.xs },
  grid: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.md },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.9 },
  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
  },
  liveEmoji: { fontSize: 30 },
  liveTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  liveDescription: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  liveArrow: { fontSize: 28, color: colors.muted, fontWeight: '300' },
  cardEmoji: { fontSize: 34, position: 'absolute', top: spacing.lg, left: spacing.lg },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    lineHeight: 16,
  },
})
