import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { colors, spacing } from '@/theme'

const PANEL_WIDTH = 280

const NAV_ITEMS = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/journal', label: 'Journal Entries', emoji: '📓' },
  { href: '/location', label: 'Locations', emoji: '📍' },
  { href: '/plants', label: 'Plant Species', emoji: '🌿' },
  { href: '/wildlife', label: 'Livestock & Wildlife', emoji: '🐄' },
  { href: '/pasture-live', label: 'My Pasture Live', emoji: '📊' },
] as const

type NavHref = (typeof NAV_ITEMS)[number]['href']

interface SideMenuContextValue {
  open: () => void
  close: () => void
}

const SideMenuContext = createContext<SideMenuContextValue>({
  open: () => {},
  close: () => {},
})

export function useSideMenu() {
  return useContext(SideMenuContext)
}

export function SideMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [anim] = useState(() => new Animated.Value(0))
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start()
  }, [open, anim])

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PANEL_WIDTH, 0],
  })
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  })

  function go(href: NavHref) {
    setOpen(false)
    router.navigate(href)
  }

  return (
    <SideMenuContext.Provider
      value={{ open: () => setOpen(true), close: () => setOpen(false) }}
    >
      <View style={styles.root}>
        {children}

        <View style={styles.overlay} pointerEvents={open ? 'auto' : 'none'}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable
              style={styles.flex}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={() => setOpen(false)}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.panel,
              {
                transform: [{ translateX }],
                paddingTop: insets.top + spacing.lg,
              },
            ]}
          >
            <Text style={styles.brand}>CLY</Text>
            <Text style={styles.brandSub}>Rangeland journal</Text>

            <View style={styles.links}>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href
                return (
                  <Pressable
                    key={item.href}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => go(item.href)}
                    style={({ pressed }) => [
                      styles.link,
                      active && styles.linkActive,
                      pressed && styles.linkPressed,
                    ]}
                  >
                    <Text style={styles.linkEmoji}>{item.emoji}</Text>
                    <Text style={styles.linkText}>{item.label}</Text>
                  </Pressable>
                )
              })}
            </View>
          </Animated.View>
        </View>
      </View>
    </SideMenuContext.Provider>
  )
}

export function MenuButton({ color = colors.text }: { color?: string }) {
  const { open } = useSideMenu()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      onPress={open}
      hitSlop={8}
      style={styles.menuButton}
    >
      <Text style={[styles.menuIcon, { color }]}>☰</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 1000 },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 0 },
    elevation: 16,
  },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  brandSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  links: { gap: spacing.xs, marginTop: spacing.sm },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  linkActive: { backgroundColor: 'rgba(255,255,255,0.16)' },
  linkPressed: { backgroundColor: 'rgba(255,255,255,0.10)' },
  linkEmoji: { fontSize: 18 },
  linkText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  menuIcon: { fontSize: 22, fontWeight: '700', lineHeight: 24 },
})
