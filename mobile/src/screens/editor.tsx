import { useRef, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { PhotoOrder } from '@/features/wardrobe/photo-order';
import { SymbolView } from 'expo-symbols';
import DatePicker from '@expo/ui/community/datetime-picker';
import * as Picker from 'expo-image-picker';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, mutate } from '@/features/wardrobe/api';
import { toast, useRecord, useWardrobe } from '@/features/wardrobe/session';
import { conditions, emptyItem, photoLimit, sizes, type Group, type Item, type Named } from '@/features/wardrobe/model';
import { accent, outline, surface, Button, CloseButton, errorColor, Field, FieldFrame, ink, Label, words } from '@/features/wardrobe/ui';

import { Combobox } from '@/features/wardrobe/combobox';

export default function Editor() {
  const { group, id } = useLocalSearchParams<{ group: Group; id?: string }>();
  const { row, error, retry } = useRecord(group, id);
  if (id && !row) return error ? <Button title="Retry loading record" onPress={retry} /> : <ActivityIndicator />;
  if (row && 'name' in row && row.is_default) return <Label>This default record is read-only.</Label>;
  return <EditorForm key={group + id} group={group} id={id} row={row} />;
}

function EditorForm({ group, id, row }: { group: Group; id?: string; row?: Named | Item }) {
  const { invalidate } = useWardrobe();
  const [busy, setBusy] = useState(false);
  const processing = useRef(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const insets = useSafeAreaInsets();
  const itemGroup = group === 'items';
  const existing = row && 'photos' in row ? row : undefined;
  const [item, setItem] = useState(() => existing ?? emptyItem('', ''));
  const [size, setSize] = useState<Item['size'] | ''>(existing?.size ?? '');
  const [advanced, setAdvanced] = useState(Boolean(existing?.condition || existing?.purchased || existing?.note));
  const [name, setName] = useState(() => row && 'name' in row ? row.name : '');
  const [submitted, setSubmitted] = useState(false);
  const [showDate, setShowDate] = useState(false);
  function update<K extends keyof Item>(key: K, value: Item[K]) {
    setItem(old => ({ ...old, [key]: value }));
  }
  async function submit(deleting = false) {
    if (processing.current) return;
    processing.current = true;
    setBusy(true);
    setErrors({});
    try {
      const value = itemGroup ? { ...item, size: size || item.size } : name.trim();
      toast(await mutate(group, id, deleting ? undefined : value, existing));
      if (deleting && itemGroup) router.dismissTo('/');
      else router.back();
      invalidate();
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fields);
      toast(error instanceof Error ? error.message : 'Request failed.');
    } finally {
      processing.current = false;
      setBusy(false);
    }
  }
  function save() {
    setSubmitted(true);
    if (itemGroup ? (!item.photos.length || !size || !item.brand || !item.category) : !name.trim()) return;
    void submit();
  }
  const [dialog, setDialog] = useState<'photos' | 'delete' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [picking, setPicking] = useState(false);

  const fallback = group === 'brands' ? 'Unknown' : 'Uncategorized';
  const explanation = itemGroup ? 'This cloth and its photos will be deleted.'
      : 'All clothes assigned to “' + name + '” will be reassigned to “' + fallback + '”.';

  async function pickPhotos(camera: boolean) {
    setDialog(null);
    setPicking(true);
    try {
      if (camera && !(await Picker.requestCameraPermissionsAsync()).granted) {
        Alert.alert('Camera access needed', 'Allow camera access in Android settings or choose a photo from your gallery.');
        return;
      }
      const result = camera ? await Picker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
        : await Picker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true,
            selectionLimit: photoLimit - item.photos.length });
      if (!result.canceled) {
        const photos: Item['photos'] = [];
        for (const asset of result.assets) {
          const context = ImageManipulator.manipulate(asset.uri);
          try {
            if (Math.max(asset.width, asset.height) > 1440) {
              context.resize(asset.width >= asset.height ? { width: 1440 } : { height: 1440 });
            }
            const image = await context.renderAsync();
            try {
              const jpeg = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.72 });
              photos.push({ uri: jpeg.uri, type: 'image/jpeg', name: 'photo.jpg' });
            } finally {
              image.release();
            }
          } finally {
            context.release();
          }
        }
        setItem(old => ({ ...old, photos: [...old.photos, ...photos].slice(0, photoLimit) }));
      }
    } catch (error) {
      Alert.alert('Couldn’t add photos', error instanceof Error ? error.message : 'Try taking or selecting the photo again.');
    } finally {
      setPicking(false);
    }
  }
  return <ScrollView scrollEnabled={!dragging} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: insets.bottom + 32 }}>
    <Stack.Screen options={{ title: (id ? 'Edit ' : 'Add ') + words[group] }} />
    {itemGroup ? <>
      <Combobox title="Size" options={sizes.map(size => ({ id: size, name: size }))} value={size} error={errors.size?.[0] || (submitted && !size ? 'Select a size.' : undefined)}
        change={v => setSize(v as Item['size'])} />
      <Combobox title="Brand" options={[]} remote="brands" selectedName={item.brandName} error={errors.brand_id?.[0] || (submitted && !item.brand ? 'Select a brand.' : undefined)} value={item.brand} change={(id, name) => setItem(old => ({ ...old, brand: id, brandName: name }))} />
      <Combobox title="Category" options={[]} remote="categories" selectedName={item.categoryName} error={errors.category_id?.[0] || (submitted && !item.category ? 'Select a category.' : undefined)} value={item.category} change={(id, name) => setItem(old => ({ ...old, category: id, categoryName: name }))} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>Advanced</Label>
        <Switch accessibilityLabel="Advanced" thumbColor={ink} trackColor={{ true: accent, false: ink + '55' }}
          value={advanced} onValueChange={setAdvanced} />
      </View>
      {advanced && <>
      <Combobox title="Condition" error={errors.condition?.[0]} required={false} searchable={false} value={item.condition}
        options={[{ id: '', name: 'Select' }, ...conditions.map((value, index) => ({
          id: value, name: value + '  ' + '★'.repeat(conditions.length - index),
        }))]} change={value => update('condition', value)} />
      <FieldFrame title="Purchase date" error={errors.purchased_date?.[0]}>
        <View style={{ flexDirection: 'row', backgroundColor: surface, borderColor: outline, borderWidth: 1, borderRadius: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={'Choose purchase date, ' + (item.purchased || 'unset')}
            onPress={() => setShowDate(true)} style={{ flex: 1, minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <SymbolView name={{ android: 'calendar_today', ios: 'calendar', web: 'calendar_today' }} size={20} tintColor={accent} />
            <Label>{item.purchased || 'Select date'}</Label>
          </Pressable>
          {!!item.purchased && <Pressable accessibilityLabel="Clear purchase date" accessibilityRole="button"
            onPress={() => update('purchased', '')} style={{ width: 48, alignItems: 'center', justifyContent: 'center' }}>
            <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={18} tintColor={ink} />
          </Pressable>}
        </View>
        {showDate && <DatePicker value={item.purchased ? new Date(item.purchased + 'T12:00:00') : new Date()} presentation="dialog"
          onDismiss={() => setShowDate(false)} onValueChange={(_, date) => {
            setShowDate(false);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            update('purchased', [date.getFullYear(), month, day].join('-'));
          }} />}
      </FieldFrame>
      <Field error={errors.note?.[0]} title="Note" value={item.note} multiline change={v => update('note', v)} />
      </>}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>Active</Label><Switch accessibilityLabel="Active" thumbColor={ink} trackColor={{ true: accent, false: ink + '55' }}
          value={item.active} onValueChange={v => update('active', v)} />
      </View>
      <FieldFrame title={'Photos · ' + item.photos.length + ' / ' + photoLimit} required error={errors.photos?.[0] || (submitted && !item.photos.length ? 'Add at least one photo.' : undefined)}>
      <Label>Drag photos to reorder. The first is the cover.</Label>
      <View style={{ gap: 8, padding: 8, borderWidth: 1, borderRadius: 8, borderColor: submitted && !item.photos.length ? errorColor : outline }}>
      {item.photos.length > 0 && <PhotoOrder photos={item.photos} change={photos => update('photos', photos)} onDrag={setDragging} />}
      {item.photos.length < photoLimit && <Button title="Add photos" disabled={picking} onPress={() => setDialog('photos')} />}
      </View></FieldFrame>
    </> : <Field title="Name" required error={errors.name?.[0] || (submitted && !name.trim() ? 'Enter a ' + words[group] + ' name.' : undefined)} value={name} change={setName} />}
    <Button filled disabled={busy || picking} title={'Save ' + words[group]} onPress={save} />
    {id && <Button title={'Delete ' + words[group]} disabled={busy || picking} onPress={() => setDialog('delete')} />}
    {(busy || picking) && <ActivityIndicator />}
    <Modal transparent visible={dialog !== null} onRequestClose={() => setDialog(null)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0009' }}>
        <View style={{ backgroundColor: surface, borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>{dialog === 'delete' ? 'Delete ' + words[group] + '?' : 'Add photos'}</Label>
            <CloseButton label="Close dialog" onPress={() => setDialog(null)} />
          </View>
          {dialog === 'delete' ? <>
            <Label>{explanation}</Label>
            <Button title="Delete" onPress={() => { setDialog(null); void submit(true); }} />
          </> : <>
            <Button title="Camera" onPress={() => pickPhotos(true)} />
            <Button title="Gallery" onPress={() => pickPhotos(false)} />
          </>}
        </View>
      </View>
    </Modal>
  </ScrollView>;
}
