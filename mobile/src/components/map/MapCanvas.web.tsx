import { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const readyRef = useRef(false)
  const payload = useMemo(
    () => buildPayload(polygon, vertices, dataPoints),
    [polygon, vertices, dataPoints],
  )

  const push = useCallback((p: string) => {
    if (readyRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(p, '*')
    }
  }, [])

  useEffect(() => {
    push(payload)
  }, [payload, push])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (typeof event.data !== 'string') return
      let data: { type?: string; lat?: number; lng?: number }
      try {
        data = JSON.parse(event.data)
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
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [payload, onMapPress, push])

  return (
    <View style={[styles.wrap, { height }]}>
      {/* react-dom renders this as a real DOM iframe on web. */}
      <iframe
        ref={iframeRef}
        title="Property map"
        srcDoc={MAP_HTML}
        style={{ border: 'none', width: '100%', height, display: 'block' }}
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
})
