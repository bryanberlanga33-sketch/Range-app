import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme'
import type { PlantCategory } from '@/data/plantCatalog'

const CATEGORY_EMOJI: Record<PlantCategory, string> = {
  Grass: '🌾',
  Forb: '🌼',
  Brush: '🌳',
}

interface PlantImageProps {
  uri?: string
  category: PlantCategory
  size: number
  radius?: number
}

/** Remote plant photo with a category-emoji fallback if the image fails. */
export function PlantImage({ uri, category, size, radius = 10 }: PlantImageProps) {
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size, borderRadius: radius }

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, box]}>
        <Text style={{ fontSize: size * 0.45 }}>{CATEGORY_EMOJI[category]}</Text>
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, box]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  )
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.accentSoft },
  fallback: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
