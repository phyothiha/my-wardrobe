import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState, type ReactNode } from 'react';

export const ink = '#F7F4FA', paper = '#18161C';
export const accent = '#C4A3FF', surface = '#27242D', outline = '#706977', tile = '#F1EFF2';
export const heading = 'BricolageGrotesque_600SemiBold', body = 'DMSans_400Regular';
export const badgeColors = {
  active: { backgroundColor: '#503B68', color: '#F1E5FF', borderColor: '#806596' },
  inactive: { backgroundColor: '#37343C', color: '#DED9E3', borderColor: '#68616D' },
};
export const words = { items: 'Cloth', brands: 'brand', categories: 'category' } as const;
export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}
export function CloseButton({ label, onPress, compact = false }: { label: string; onPress: () => void; compact?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={{ width: 48, height: compact ? 32 : 48, alignItems: 'center', justifyContent: 'center' }}>
    <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={compact ? 16 : 24} tintColor={ink} />
  </Pressable>;
}
export function Button({ title, onPress, filled = false, selected, disabled, expanded }: { title: string; onPress: () => void; filled?: boolean; selected?: boolean; disabled?: boolean; expanded?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ selected, disabled, expanded }} onPress={onPress}
    style={({ pressed }) => [styles.button, filled && { backgroundColor: accent, borderColor: accent }, pressed && { opacity: 0.7 }, disabled && { opacity: 0.45 }]}>
    <Text style={[styles.label, filled && { color: paper }]}>{title}</Text>
  </Pressable>;
}
export const errorColor = '#FF9AA8';
export function FieldFrame({ title, required, error, children }: { title: string; required?: boolean; error?: string; children: ReactNode }) {
  return <View style={{ gap: 6 }}>
    <Text style={[styles.label, error ? { color: errorColor } : null]}>{title}{required ? ' *' : ''}</Text>
    {children}
    {error && <Text accessibilityLiveRegion="polite" style={[styles.label, { color: errorColor }]}>{error}</Text>}
  </View>;
}
export function Field({ title, value, change, multiline, placeholder, required, error }: {
  title: string; value: string; change: (value: string) => void; multiline?: boolean; placeholder?: string; required?: boolean; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return <FieldFrame title={title} required={required} error={error}>
    <TextInput accessibilityLabel={required ? title + ", required" : title} value={value} onChangeText={change} multiline={multiline}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} selectionColor={accent} placeholder={placeholder} placeholderTextColor={ink + '99'} style={[styles.input, focused && { borderColor: accent }, error ? { borderColor: errorColor } : null, multiline && { minHeight: 84, textAlignVertical: 'top' }]} />
  </FieldFrame>;
}
const styles = StyleSheet.create({
  label: { fontFamily: body, color: ink, fontSize: 15 },
  button: { minHeight: 44, borderWidth: 1, borderColor: outline, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 },
  input: { borderWidth: 1, backgroundColor: surface, borderColor: outline, borderRadius: 12, padding: 12, fontFamily: body, color: ink, fontSize: 17 },
});
