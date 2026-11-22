import { useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator, FlatList, Modal, ScrollView, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecord } from '@/features/wardrobe/session';
import { conditions } from '@/features/wardrobe/model';
import { badgeColors, accent, tile, body, Button, CloseButton, ink, Label, paper } from '@/features/wardrobe/ui';

export default function Cloth() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { row, error, retry } = useRecord('items', id);
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const cloth = row && 'photos' in row ? row : undefined;
  if (!cloth) return <View>{error ? <Button title="Retry loading cloth" onPress={retry} /> : <ActivityIndicator />}</View>;
  const index = Math.min(selected, cloth.photos.length - 1);
  const rank = conditions.indexOf(cloth.condition);
  const brand = cloth.brandName;
  const category = cloth.categoryName;
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: insets.bottom + 20 }}>
    <Stack.Screen options={{ title: 'Cloth details' }} />
    <Text style={[{ alignSelf: 'flex-end', borderRadius: 16, paddingVertical: 5, paddingHorizontal: 14,
      fontFamily: body }, cloth.active ? badgeColors.active : badgeColors.inactive]}>
      {cloth.active ? 'Active' : 'Inactive'}
    </Text>
    <Pressable accessibilityRole="button" accessibilityLabel={'Enlarge photo ' + (index + 1)} onPress={() => setPreview(true)}>
    <Image source={cloth.photos[index]} contentFit="contain" accessibilityLabel={'Photo ' + (index + 1)}
      style={{ width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: tile }} />
    </Pressable>
    {cloth.photos.length > 1 && <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
      {cloth.photos.map((photo, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={'View photo ' + (i + 1)}
        accessibilityState={{ selected: i === index }} onPress={() => setSelected(i)}
        style={{ padding: 3, borderRadius: 6, borderWidth: 2, borderColor: i === index ? accent : 'transparent' }}>
        <Image source={photo} style={{ width: 64, height: 64, borderRadius: 5, backgroundColor: tile }} />
      </Pressable>)}
    </ScrollView>}
    <Label>{brand} · {category}</Label>
    <Label>Size · {cloth.size}</Label>
     {rank >= 0 && <Text accessibilityLabel={'Condition, ' + (conditions.length - rank) + ' out of 5 stars'} style={{ fontFamily: body, color: ink, fontSize: 16 }}>
      Condition · {'★'.repeat(conditions.length - rank)}
    </Text>}
    {!!cloth.purchased && <Label>Purchased · {cloth.purchased}</Label>}
    {!!cloth.note && <Label>{cloth.note}</Label>}
    <Button filled title="Edit Cloth" onPress={() => router.push({ pathname: '/editor', params: { group: 'items', id } })} />
    <Modal visible={preview} animationType="fade" onRequestClose={() => setPreview(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: paper, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label>Photo {index + 1} of {cloth.photos.length}</Label>
          <CloseButton label="Close photo" onPress={() => setPreview(false)} />
        </View>
        <View style={{ flex: 1 }} onLayout={event => setPageWidth(event.nativeEvent.layout.width)}>
          {preview && pageWidth > 0 && <FlatList key={pageWidth} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            data={cloth.photos} initialScrollIndex={index} keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
            onMomentumScrollEnd={event => {
              const page = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
              setSelected(Math.max(0, Math.min(cloth.photos.length - 1, page)));
            }}
            renderItem={({ item, index: i }) => <Image source={item} contentFit="contain"
              accessibilityLabel={'Photo ' + (i + 1)} style={{ width: pageWidth, height: '100%', backgroundColor: typeof item === 'number' ? tile : paper }} />} />}
        </View>
      </SafeAreaView>
    </Modal>
  </ScrollView>;
}
