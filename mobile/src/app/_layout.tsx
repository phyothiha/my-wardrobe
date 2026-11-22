import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { WardrobeProvider } from '@/features/wardrobe/session';
import { ink, paper, heading } from '@/features/wardrobe/ui';

export default function Layout() {
  const [ready, error] = useFonts({ BricolageGrotesque_600SemiBold, DMSans_400Regular });
  if (!ready && !error) return null;
  return <WardrobeProvider><StatusBar style="light" /><Stack screenOptions={{
    contentStyle: { backgroundColor: paper }, headerStyle: { backgroundColor: paper },
    headerTintColor: ink, headerTitleStyle: { fontFamily: heading, fontSize: 23 },
  }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="editor" options={{ title: 'Edit record' }} />
  </Stack></WardrobeProvider>;
}
