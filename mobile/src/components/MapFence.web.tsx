import { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { colors } from '@/theme'
import { MAP_HTML } from './map/mapHtml'
import { PointsEditor } from './map/PointsEditor'
import { useFence } from './map/useFence'
import type { GeoPoint, MapFenceProps } from './map/types'

export function MapFence({ points, onChange }: MapFenceProps) {
  const { addPoint, renamePoint, removePoint, clear } = useFence(points, onChange)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const readyRef = useRef(false)

  const pushPoints = useCallback((pts: GeoPoint[]) => {
    if (readyRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify(pts), '*')
    }
  }, [])

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
        pushPoints(points)
      } else if (
        data.type === 'add' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        addPoint(data.lat, data.lng)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [points, addPoint, pushPoints])

  useEffect(() => {
    pushPoints(points)
  }, [points, pushPoints])

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        {/* react-dom renders this as a real DOM iframe on web. */}
        <iframe
          ref={iframeRef}
          title="Property fence map"
          srcDoc={MAP_HTML}
          style={{ border: 'none', width: '100%', height: 320, display: 'block' }}
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
})
