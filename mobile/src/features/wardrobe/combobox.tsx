import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useListing } from './session';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchNames, type Named } from './model';
import { body, surface, outline, Button, CloseButton, errorColor, Field, FieldFrame, heading, ink, Label, paper } from './ui';

type Props = { title: string; options: Named[]; value: string; remote?: 'brands' | 'categories'; selectedName?: string; change: (value: string, name: string) => void; error?: string; required?: boolean; searchable?: boolean };
export function Combobox({ title, options, value, change, remote, selectedName, error, required = true, searchable = true }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [term] = useDebounce(query.trim(), 300);
  const page = useListing(open && remote ? remote + '/search?filter[name]=' + encodeURIComponent(term) : undefined);
  const rows = remote ? [...options.filter(row => !row.id), ...page.rows.filter((row): row is Named => 'name' in row)] : searchNames(options, query);
  const selected = selectedName || options.find(option => option.id === value)?.name || 'Select';
  return <FieldFrame title={title} required={required} error={error}>
    <Pressable accessibilityRole="combobox" accessibilityLabel={[title, required && 'required', selected].filter(Boolean).join(', ')}
      accessibilityState={{ expanded: open }} onPress={() => { setQuery(''); setOpen(true); }}
      style={{ borderColor: error ? errorColor : outline, borderWidth: 1, backgroundColor: surface, borderRadius: 12, padding: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontFamily: body, color: ink, fontSize: 17, flex: 1 }}>{selected}</Text><Label>⌄</Label>
    </Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={{ flex: 1, padding: 20, gap: 16, backgroundColor: paper }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text accessibilityRole="header" style={{ color: ink, fontFamily: heading, fontSize: 32 }}>Select {title.toLowerCase()}</Text>
          <CloseButton label={"Close " + title.toLowerCase() + " selection"} onPress={() => setOpen(false)} />
        </View>
        {searchable && <Field title="Search" value={query} change={setQuery} />}
        <FlatList data={rows} keyExtractor={row => row.id} keyboardShouldPersistTaps="handled"
          ListFooterComponent={page.loading ? <ActivityIndicator /> : page.error ? <Button title="Retry search" onPress={page.load} /> : undefined}
          ListEmptyComponent={!page.loading && !page.error ? <Label>No matches.</Label> : undefined}
          renderItem={({ item }) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: value === item.id }}
            onPress={() => { change(item.id, item.name); setOpen(false); }}
            style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: ink + '33' }}>
            <Label>{item.name}{value === item.id ? '  ✓' : ''}</Label>
          </Pressable>} />
      </SafeAreaView>
    </Modal>
  </FieldFrame>;
}
