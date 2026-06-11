import { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@/theme'

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

interface LabeledInputProps extends TextInputProps {
  label: string
}

export function LabeledInput({ label, style, ...rest }: LabeledInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.muted}
        {...rest}
      />
    </View>
  )
}

export function PrimaryButton({
  title,
  onPress,
}: {
  title: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={styles.error}>{children}</Text>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{children}</Text>
    </View>
  )
}

export function RecordItem({
  emoji,
  title,
  subtitle,
  meta,
  onRemove,
}: {
  emoji: string
  title: string
  subtitle?: string
  meta?: string
  onRemove: () => void
}) {
  return (
    <View style={styles.record}>
      <Text style={styles.recordEmoji}>{emoji}</Text>
      <View style={styles.flex}>
        <Text style={styles.recordTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.recordSubtitle}>{subtitle}</Text>}
        {!!meta && <Text style={styles.recordMeta}>{meta}</Text>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${title}`}
        onPress={onRemove}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  field: { gap: spacing.xs },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
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
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonPressed: { backgroundColor: colors.accentStrong },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  empty: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: spacing.lg,
  },
  emptyText: { color: colors.muted, fontSize: 14 },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#fdfcf9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  recordEmoji: { fontSize: 26 },
  recordTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  recordSubtitle: { fontSize: 14, color: colors.text, marginTop: 2 },
  recordMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  removeButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  removeButtonText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
})
