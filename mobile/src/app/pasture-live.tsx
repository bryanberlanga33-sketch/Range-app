import { Screen } from '@/components/ui'
import { PastureLiveList } from '@/components/PastureLive'
import { PastureCollections } from '@/components/PastureCollections'

export default function PastureLiveScreen() {
  return (
    <Screen>
      <PastureCollections />
      <PastureLiveList />
    </Screen>
  )
}
