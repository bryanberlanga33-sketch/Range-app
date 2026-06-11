import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '@/theme'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.accentStrong },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Rangeland Journal' }} />
        <Stack.Screen name="journal" options={{ title: 'Journal Entries' }} />
        <Stack.Screen name="location" options={{ title: 'Locations' }} />
        <Stack.Screen name="plants" options={{ title: 'Plant Species' }} />
        <Stack.Screen name="wildlife" options={{ title: 'Livestock & Wildlife' }} />
      </Stack>
    </>
  )
}
