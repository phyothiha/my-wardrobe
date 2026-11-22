import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { accent, body, ink, paper } from '@/features/wardrobe/ui';

export default function CollectionTabs() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: ink,

    tabBarStyle: { backgroundColor: paper, borderTopColor: ink + '22' },
    tabBarLabelStyle: { fontFamily: body, fontSize: 12 },
    tabBarItemStyle: { justifyContent: 'center' },
    sceneStyle: { backgroundColor: paper },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Clothes',
      tabBarIcon: ({ focused, color }) => <View style={{ width: 44, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: focused ? accent : 'transparent' }}><SymbolView name={{ ios: 'tshirt', android: 'checkroom', web: 'checkroom' }} size={20} tintColor={focused ? paper : color} /></View>,
    }} />
    <Tabs.Screen name="brands" options={{ title: 'Brands',
      tabBarIcon: ({ focused, color }) => <View style={{ width: 44, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: focused ? accent : 'transparent' }}><SymbolView name={{ ios: 'tag', android: 'sell', web: 'sell' }} size={20} tintColor={focused ? paper : color} /></View>,
    }} />
    <Tabs.Screen name="categories" options={{ title: 'Categories',
      tabBarIcon: ({ focused, color }) => <View style={{ width: 44, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: focused ? accent : 'transparent' }}><SymbolView name={{ ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' }} size={20} tintColor={focused ? paper : color} /></View>,
    }} />
  </Tabs>;
}
