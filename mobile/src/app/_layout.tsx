import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SideMenuProvider, MenuButton } from '@/components/SideMenu'
import { colors } from '@/theme'

export default function RootLayout() {
  return (
    <SideMenuProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', color: colors.text },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bg },
          headerRight: () => <MenuButton />,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: 'CLY' }} />
        <Stack.Screen name="pasture-live" options={{ title: 'My Pasture Live' }} />
        <Stack.Screen name="journal" options={{ title: 'Journal Entries' }} />
        <Stack.Screen name="location" options={{ title: 'Locations' }} />
        <Stack.Screen name="plants" options={{ title: 'Plant Species' }} />
        <Stack.Screen name="wildlife" options={{ title: 'Livestock & Wildlife' }} />
      </Stack>
    </SideMenuProvider>
  )
}
