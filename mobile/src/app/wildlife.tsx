import { Screen } from '@/components/ui'
import { LivestockSection } from '@/components/LivestockSection'
import { WildlifeSection } from '@/components/WildlifeSection'
import { useCollection } from '@/store/useCollection'
import type { LocationRecord } from '@/models'

export default function WildlifeScreen() {
  const { items: polygons } = useCollection<LocationRecord>('locations')

  return (
    <Screen>
      <LivestockSection polygons={polygons} />
      <WildlifeSection polygons={polygons} />
    </Screen>
  )
}
