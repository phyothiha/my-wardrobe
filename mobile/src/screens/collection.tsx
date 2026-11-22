import { useState } from 'react';
import { Combobox } from '@/features/wardrobe/combobox';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useDebounce } from 'use-debounce';
import { ActivityIndicator, FlatList, Modal, ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListing } from '@/features/wardrobe/session';
import { emptyFilters, photoLimit, sizes, type Group } from '@/features/wardrobe/model';
import { badgeColors, tile, Button, Field, heading, ink, Label, paper, words } from '@/features/wardrobe/ui';

const titles = { items: 'Clothes', brands: 'Brands', categories: 'Categories' };
export default function Collection({ group }: { group: Group }) {

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const filterCount = Object.values(filters).filter(Boolean).length;
  const [term] = useDebounce(query.trim(), 300);
  const params = new URLSearchParams();
  if (group === 'items') {
    if (filters.brand) params.set('filter[brand_id]', filters.brand);
    if (filters.category) params.set('filter[category_id]', filters.category);
    if (filters.size) params.set('filter[size]', filters.size);
    if (filters.status) params.set('filter[is_active]', filters.status === 'Active' ? '1' : '0');
  } else if (term) params.set('filter[name]', term);
  const resource = group === 'items' ? 'clothes' : group;
  const { rows, total, loading, error, load } = useListing(resource + (params.toString() ? '/search?' + params : ''));
  const [filterNames, setFilterNames] = useState<Record<string, string>>({});
  const filterOptions = {
    brand: [], category: [], size: sizes.map(id => ({ id, name: id })),
    status: ['Active', 'Inactive'].map(id => ({ id, name: id })),
  };
  function edit(id?: string) {
    router.push({ pathname: '/editor', params: id ? { group, id } : { group } });
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}><FlatList key={group} keyboardShouldPersistTaps="handled" contentContainerStyle={s.list} data={rows} onEndReached={error ? undefined : load} onEndReachedThreshold={0.3}
    ListFooterComponent={loading ? <ActivityIndicator /> : error ? <Button title="Retry loading" onPress={load} /> : undefined}
    keyExtractor={row => row.id} numColumns={group === 'items' ? 2 : 1}
    columnWrapperStyle={group === 'items' ? s.columns : undefined}
    ListHeaderComponent={<View style={s.header}>
      <Text accessibilityRole="header" style={s.title}>{group === 'items' ? 'My wardrobe' : titles[group]}</Text>
      {group !== 'items' && <Field title={'Search ' + group} value={query} change={setQuery} placeholder="Search by name" />}
      <View style={s.line}><Label>{total} {total === 1 ? words[group].toLowerCase() : titles[group].toLowerCase()}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {group === 'items' && <View style={{ alignSelf: 'flex-end' }}>
        <Button title={'Filters' + (filterCount ? ' (' + filterCount + ')' : '')} expanded={showFilters} onPress={() => { setDraftFilters(filters); setShowFilters(true); }} />
      </View>}

        <Button filled title={'＋ Add ' + words[group]} onPress={() => edit()} /></View></View>
    </View>}
    ListEmptyComponent={loading || error ? undefined : <Label>{group === 'items' && filterCount ? 'No clothes match these filters.' : query.trim() ? 'No matching ' + group + '.' : 'No ' + titles[group].toLowerCase() + ' yet.'}</Label>}
    renderItem={({ item }) => {
      const garment = 'photos' in item;
      const name = garment ? item.categoryName
        : item.name + (item.clothes_count ? ' (' + item.clothes_count + ')' : '');
      return <Pressable disabled={!garment && item.is_default} accessibilityRole={garment || !item.is_default ? "button" : undefined} accessibilityLabel={garment ? [name, item.size, item.active ? 'Active' : 'Inactive'].join(', ') : item.is_default ? name : 'Edit ' + name}
        onPress={() => garment ? router.push({ pathname: '/cloth', params: { id: item.id } }) : edit(item.id)} style={garment ? s.card : s.entry}>
        {garment && <View style={s.tile}>
          <Image source={item.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Text style={[s.badge, item.active ? badgeColors.active : badgeColors.inactive]}>{item.active ? 'Active' : 'Inactive'} · {item.photos.length}/{photoLimit}</Text>
        </View>}
        <Text style={s.name}>{name}</Text>
        <Label>{garment ? [item.brandName, item.size].filter(Boolean).join(' · ') : item.is_default ? '' : 'Edit'}</Label>
      </Pressable>;
    }} />
    <Modal visible={showFilters} transparent animationType="fade" onRequestClose={() => setShowFilters(false)}>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable accessibilityLabel="Close filters" accessibilityRole="button" onPress={() => setShowFilters(false)}
          style={[StyleSheet.absoluteFill, { backgroundColor: '#00000099' }]} />
        {showFilters && <Animated.View entering={SlideInRight.duration(220)} style={{ width: '85%', maxWidth: 400, backgroundColor: paper }}>
          <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
            <Text accessibilityRole="header" style={s.name}>Filters</Text>
          {(Object.keys(filterOptions) as (keyof typeof filters)[]).map(key => <Combobox key={key}
            title={key[0].toUpperCase() + key.slice(1)} required={false} searchable={key === 'brand' || key === 'category'}
            options={[{ id: '', name: 'All' }, ...filterOptions[key]]} value={draftFilters[key]}
            remote={key === 'brand' ? 'brands' : key === 'category' ? 'categories' : undefined}
            selectedName={filterNames[key + draftFilters[key]]}
            change={(value, name) => {
              setFilterNames(old => ({ ...old, [key + value]: name }));
              setDraftFilters(old => ({ ...old, [key]: value }));
            }} />)}
            <Button title="Clear filters" disabled={!Object.values(draftFilters).some(Boolean)} onPress={() => setDraftFilters(emptyFilters)} />
            <Button title="Done" filled onPress={() => { setFilters(draftFilters); setShowFilters(false); }} />
          </ScrollView>
          </SafeAreaView>
        </Animated.View>}
      </View>
    </Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1 }, list: { padding: 20, paddingBottom: 40 }, header: { gap: 18, paddingBottom: 20 },
  title: { fontFamily: heading, color: ink, fontSize: 36 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  columns: { justifyContent: 'space-between' }, card: { width: '48%', gap: 4, marginBottom: 22 },
  tile: { aspectRatio: 0.98, backgroundColor: tile, borderRadius: 14, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', bottom: 8, left: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 2 }, name: { color: ink, fontFamily: heading, fontSize: 21, flexShrink: 1 },
  entry: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: ink + '44' },
});
