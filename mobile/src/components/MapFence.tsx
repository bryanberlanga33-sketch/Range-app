import { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { colors } from '@/theme'
import { MAP_HTML } from './map/mapHtml'
import { PointsEditor } from './map/PointsEditor'
import { useFence } from './map/useFence'
import type { GeoPoint, MapFenceProps } from './map/types'

export function MapFence({ points, onChange }: MapFenceProps) {
  const { addPoint, renamePoint, removePoint, clear } = useFence(points, onChange)
  const webRef = useRef<WebView | null>(null)
  const readyRef = useRef(false)

  const pushPoints = useCallback((pts: GeoPoint[]) => {
    if (readyRef.current && webRef.current) {
      const payload = JSON.stringify(JSON.stringify(pts))
      webRef.current.injectJavaScript(`window.__renderPoints(${payload}); true;`)
    }
  }, [])

  useEffect(() => {
    pushPoints(points)
  }, [points, pushPoints])

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let data: { type?: string; lat?: number; lng?: number }
      try {
        data = JSON.parse(event.nativeEvent.data)
      } catch {
        return
      }
      if (data.type === 'ready') {
        readyRef.current = true
        pushPoints(points)
      } else if (
        data.type === 'add' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        addPoint(data.lat, data.lng)
      }
    },
    [points, addPoint, pushPoints],
  )

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: MAP_HTML }}
          onMessage={onMessage}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
      <PointsEditor
        points={points}
        onRename={renamePoint}
        onRemove={removePoint}
        onClear={clear}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  mapWrapper: {
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: colors.border,
    borderWidth: 1,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
})
