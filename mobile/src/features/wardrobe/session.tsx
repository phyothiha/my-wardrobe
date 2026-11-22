import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ToastAndroid } from 'react-native';
import { list, record } from './api';
import type { Group, Item, Named } from './model';

const Session = createContext({ revision: 0, invalidate: () => {} });
export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  return <Session.Provider value={{ revision, invalidate: () => setRevision(n => n + 1) }}>{children}</Session.Provider>;
}
export const useWardrobe = () => use(Session);
export function toast(message: string) { ToastAndroid.show(message, ToastAndroid.LONG); }

export function useRecord(group: Group, id?: string) {
  const { revision } = useWardrobe();
  const [attempt, retry] = useState(0);
  const [result, setResult] = useState<{key: string; row?: Item | Named; error?: string}>();
  const key = [group, id, revision, attempt].join('/');
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    record(group, id, controller.signal).then(row => {
      if (!controller.signal.aborted) setResult({ key, row });
    }).catch(error => {
      if (!controller.signal.aborted) { setResult({ key, error: error.message }); toast(error.message); }
    });
    return () => controller.abort();
  }, [group, id, key]);
  return { row: result?.key === key ? result.row : undefined, error: result?.key === key ? result.error : undefined,
    retry: () => retry(n => n + 1) };
}
export function useListing(path?: string) {
  const { revision } = useWardrobe();
  const [rows, setRows] = useState<(Item | Named)[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const key = revision + '/' + (path || '');
  const [previousKey, setPreviousKey] = useState(key);
  if (key !== previousKey) {
    setPreviousKey(key);
    setRows([]);
    setTotal(0);
    setError('');
    setLoading(Boolean(path));
  }
  const cursor = useRef({ next: 1, busy: false, controller: new AbortController() });
  const load = useCallback(async () => {
    const current = cursor.current;
    if (!path || !current.next || current.busy || current.controller.signal.aborted) return;
    current.busy = true;
    setLoading(true);
    setError('');
    try {
      const page = current.next;
      const result = await list(path, page, current.controller.signal);
      if (current.controller.signal.aborted) return;
      setRows(previous => page === 1 ? result.rows : [...new Map([...previous, ...result.rows].map(row => [row.id, row])).values()]);
      setTotal(result.total);
      current.next = page < result.lastPage ? page + 1 : 0;
    } catch (e) {
      if (!current.controller.signal.aborted) {
        const message = e instanceof Error ? e.message : 'Could not load records.';
        setError(message);
        toast(message);
      }
    } finally {
      current.busy = false;
      if (!current.controller.signal.aborted) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    const controller = new AbortController();
    cursor.current = { next: 1, busy: false, controller };
    void load();
    return () => controller.abort();
  }, [load, revision]);
  return { rows, total, loading, error, load };
}
