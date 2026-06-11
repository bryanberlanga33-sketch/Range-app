import { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { colors } from '@/theme'
import { MAP_HTML } from './mapHtml'
import type { DataPoint, LatLng } from './types'

export interface MapCanvasProps {
  polygon?: LatLng[]
  vertices?: LatLng[]
  dataPoints?: DataPoint[]
  onMapPress?: (lat: number, lng: number) => void
  height?: number
}

function buildPayload(
  polygon: LatLng[],
  vertices: LatLng[],
  dataPoints: DataPoint[],
): string {
  return JSON.stringify({
    polygon: polygon.map((p) => [p.lat, p.lng]),
    vertices: vertices.map((p) => [p.lat, p.lng]),
    dataPoints: dataPoints.map((p) => ({ lat: p.lat, lng: p.lng, label: p.label })),
  })
}

export function MapCanvas({
  polygon = [],
  vertices = [],
  dataPoints = [],
  onMapPress,
  height = 300,
}: MapCanvasProps) {
  const webRef = useRef<WebView | null>(null)
  const readyRef = useRef(false)
  const payload = useMemo(
    () => buildPayload(polygon, vertices, dataPoints),
    [polygon, vertices, dataPoints],
  )

  const push = useCallback((p: string) => {
    if (readyRef.current && webRef.current) {
      const arg = JSON.stringify(p)
      webRef.current.injectJavaScript(`window.__render(${arg}); true;`)
    }
  }, [])

  useEffect(() => {
    push(payload)
  }, [payload, push])

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
        push(payload)
      } else if (
        data.type === 'add' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        onMapPress?.(data.lat, data.lng)
      }
    },
    [payload, onMapPress, push],
  )

  return (
    <View style={[styles.wrap, { height }]}>
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
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: colors.border,
    borderWidth: 1,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
})
