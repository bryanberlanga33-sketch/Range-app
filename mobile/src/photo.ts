import * as ImagePicker from 'expo-image-picker'

/**
 * Opens the device photo library and returns a persistable image URI, or null
 * if the user cancels. We prefer a base64 data URL so the photo survives app
 * reloads (on web a raw blob: URL would not persist).
 */
export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.5,
    base64: true,
  })

  if (result.canceled || result.assets.length === 0) {
    return null
  }

  const asset = result.assets[0]
  if (asset.base64) {
    const mime = asset.mimeType ?? 'image/jpeg'
    return `data:${mime};base64,${asset.base64}`
  }
  return asset.uri
}
