import Constants from 'expo-constants';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { type Group, type Item, type Named } from './model';

const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const base = (process.env.EXPO_PUBLIC_API_URL || `http://${host}:8000/api/v1`).replace(/\/$/, '');
export const pathFor = (group: Group) => group === 'items' ? 'clothes' : group;
type ClothDto = {
  id: number; brand_id: number; category_id: number; size: Item['size']; condition: string | null;
  purchased_date: string | null; note: string | null; is_active: boolean; brand_name: string; category_name: string;
  photos: { id: string; url: string }[];
};
type NamedDto = Omit<Named, 'id'> & { id: number };
type Row = ClothDto | NamedDto;
type Envelope<T> = { data: T; message: string; meta: { total: number; last_page: number } };
export class ApiError extends Error {
  constructor(message: string, readonly fields: Record<string, string[]> = {}) { super(message); }
}
async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const response = await fetch(base + '/' + path, { ...init, headers: { Accept: 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) throw new ApiError(body?.message || `Request failed (HTTP ${response.status}).`, body?.errors);
  return body;
}
function decode(row: Row): Item | Named {
  if (!('photos' in row)) return { ...row, id: String(row.id) };
  return { id: String(row.id), brand: String(row.brand_id), category: String(row.category_id),
    brandName: row.brand_name, categoryName: row.category_name, size: row.size, active: row.is_active,
    purchased: row.purchased_date || '', condition: row.condition || '', note: row.note || '',
    photos: row.photos.map(photo => {
      const url = new URL(photo.url, base);
      const uri = ['localhost', '127.0.0.1'].includes(url.hostname)
        ? new URL(url.pathname, base).href : url.href;
      return { id: photo.id, uri };
    }) };
}
export async function list(path: string, page: number, signal: AbortSignal) {
  const body = await request<Row[]>(path + (path.includes('?') ? '&' : '?') + 'page=' + page, { signal });
  return { rows: body.data.map(decode), total: body.meta.total, lastPage: body.meta.last_page };
}
export async function record(group: Group, id: string, signal: AbortSignal) {
  return decode((await request<Row>(pathFor(group) + '/' + encodeURIComponent(id), { signal })).data);
}
export async function mutate(group: Group, id: string | undefined, value?: string | Item, existing?: Item) {
  const path = pathFor(group) + (id ? '/' + encodeURIComponent(id) : '');
  if (value === undefined) return (await request(path, { method: 'DELETE' })).message;
  if (typeof value === 'string') return (await request(path, { method: id ? 'PATCH' : 'POST',
    body: JSON.stringify({ name: value }), headers: { 'Content-Type': 'application/json' } })).message;
  const form = new FormData();
  if (id) form.append('_method', 'PATCH');
  const fields = { brand_id: value.brand, category_id: value.category, size: value.size, condition: value.condition,
    purchased_date: value.purchased, note: value.note, is_active: value.active ? '1' : '0' };
  for (const [key, field] of Object.entries(fields)) form.append(key, field);
  for (const photo of existing?.photos || []) {
    if (photo.id && !value.photos.some(kept => kept.id === photo.id)) form.append('remove_photo_ids[]', photo.id);
  }
  let uploadIndex = 0;
  for (const photo of value.photos) {
    form.append('photo_order[]', photo.id ?? `new:${uploadIndex++}`);
    if (photo.id) continue;
    if (Platform.OS === 'web') {
      const response = await fetch(photo.uri);
      if (!response.ok) throw new Error('Could not read the selected photo.');
      form.append('photos[]', await response.blob(), photo.name);
    } else {
      form.append('photos[]', new File(photo.uri));
    }
  }
  return (await request(path, { method: 'POST', body: form })).message;
}
