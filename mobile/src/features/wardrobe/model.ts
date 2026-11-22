export const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export const conditions = ['Mint', 'Excellent', 'Good', 'Thrift', 'Poor'];
export const photoLimit = 5;
export type Group = 'items' | 'brands' | 'categories';
export type Named = { id: string; name: string; is_default?: boolean; clothes_count?: number };
export type Photo = { uri: string; id?: string; name?: string; type?: string };
export type Item = {
  id: string; size: typeof sizes[number]; condition: string;
  purchased: string; note: string; active: boolean; brand: string; category: string;
  brandName: string; categoryName: string; photos: Photo[];
};
export function emptyItem(brand: string, category: string): Item {
  return { id: '', size: 'M', condition: '', purchased: '', note: '', active: true, brand, category, brandName: '', categoryName: '', photos: [] };
}
export function searchNames(rows: Named[], query: string) {
  const needle = query.trim().toLowerCase();
  return rows.filter(row => row.name.toLowerCase().includes(needle));
}
export const emptyFilters = { brand: '', category: '', size: '', status: '' };
