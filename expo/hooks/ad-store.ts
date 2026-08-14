import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Advertisement } from '@/types';
import { ADVERTS as SEED_ADVERTS } from '@/data/mock';

const STORAGE_KEY = 'epas_adverts_v1';

/**
 * Ad store — admin-editable advertisements with background media support.
 * Persists changes to AsyncStorage so edits survive reloads.
 * Falls back to seed data from mock.ts on first load.
 */
export const [AdProvider, useAds] = createContextHook(() => {
  const [adverts, setAdverts] = useState<Advertisement[]>(SEED_ADVERTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted adverts on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Advertisement[];
          setAdverts(parsed);
        }
      } catch (e) {
        console.error('Failed to load adverts:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Advertisement[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((e) =>
      console.error('Failed to persist adverts:', e),
    );
  }, []);

  const updateAdvert = useCallback(
    (id: string, updates: Partial<Advertisement>) => {
      setAdverts((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addAdvert = useCallback(
    (advert: Advertisement) => {
      setAdverts((prev) => {
        const next = [...prev, advert].sort((a, b) => a.sortOrder - b.sortOrder);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const deleteAdvert = useCallback(
    (id: string) => {
      setAdverts((prev) => {
        const next = prev.filter((a) => a.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const resetToSeed = useCallback(() => {
    setAdverts(SEED_ADVERTS);
    persist(SEED_ADVERTS);
  }, [persist]);

  const activeAdverts = useMemo(
    () => adverts.filter((a) => a.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [adverts],
  );

  const getAdvertById = useCallback((id: string) => adverts.find((a) => a.id === id), [adverts]);

  return useMemo(
    () => ({
      adverts,
      activeAdverts,
      isLoaded,
      updateAdvert,
      addAdvert,
      deleteAdvert,
      resetToSeed,
      getAdvertById,
    }),
    [
      adverts,
      activeAdverts,
      isLoaded,
      updateAdvert,
      addAdvert,
      deleteAdvert,
      resetToSeed,
      getAdvertById,
    ],
  );
});
