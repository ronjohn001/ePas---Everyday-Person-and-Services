import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ServiceCategory, ServiceJob } from '@/types';
import {
  CATEGORIES as SEED_CATEGORIES,
  SERVICE_JOBS as SEED_JOBS,
} from '@/data/mock';

const STORAGE_KEY = 'epas_catalog_v1';
const SEARCH_KEY = 'epas_recent_searches_v1';
const MAX_RECENT_SEARCHES = 8;

/**
 * Catalog store — admin-editable categories and service jobs.
 * Persists changes to AsyncStorage so edits survive reloads.
 * Falls back to seed data from mock.ts on first load.
 */
export const [CatalogProvider, useCatalog] = createContextHook(() => {
  const [categories, setCategories] = useState<ServiceCategory[]>(SEED_CATEGORIES);
  const [jobs, setJobs] = useState<ServiceJob[]>(SEED_JOBS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load persisted catalog on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            categories: ServiceCategory[];
            jobs: ServiceJob[];
          };
          setCategories(parsed.categories);
          setJobs(parsed.jobs);
        }
      } catch (e) {
        console.error('Failed to load catalog:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Load persisted recent searches on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SEARCH_KEY);
        if (stored) setRecentSearches(JSON.parse(stored) as string[]);
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    })();
  }, []);

  const persist = useCallback(
    (cats: ServiceCategory[], js: ServiceJob[]) => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: cats, jobs: js })).catch(
        (e) => console.error('Failed to persist catalog:', e),
      );
    },
    [],
  );

  // ─── Category CRUD ───────────────────────────────────────────

  const updateCategory = useCallback(
    (id: string, updates: Partial<ServiceCategory>) => {
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
        persist(next, jobs);
        return next;
      });
    },
    [jobs, persist],
  );

  const addCategory = useCallback(
    (category: ServiceCategory) => {
      setCategories((prev) => {
        const next = [...prev, category].sort((a, b) => a.sortOrder - b.sortOrder);
        persist(next, jobs);
        return next;
      });
    },
    [jobs, persist],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== id);
        const nextJobs = jobs.filter((j) => j.categoryId !== id);
        setJobs(nextJobs);
        persist(next, nextJobs);
        return next;
      });
    },
    [jobs, persist],
  );

  // ─── Service Job CRUD ────────────────────────────────────────

  const updateJob = useCallback(
    (id: string, updates: Partial<ServiceJob>) => {
      setJobs((prev) => {
        const next = prev.map((j) => (j.id === id ? { ...j, ...updates } : j));
        persist(categories, next);
        return next;
      });
    },
    [categories, persist],
  );

  const addJob = useCallback(
    (job: ServiceJob) => {
      setJobs((prev) => {
        const next = [...prev, job];
        persist(categories, next);
        return next;
      });
      // Update serviceCount on the parent category
      setCategories((prev) => {
        const next = prev.map((c) =>
          c.id === job.categoryId
            ? { ...c, serviceCount: nextServiceCount(prev, job.categoryId) + 1 }
            : c,
        );
        persist(next, [...jobs, job]);
        return next;
      });
    },
    [categories, jobs, persist],
  );

  const deleteJob = useCallback(
    (id: string) => {
      setJobs((prev) => {
        const next = prev.filter((j) => j.id !== id);
        persist(categories, next);
        // Recalculate serviceCount
        setCategories((prevCats) => {
          const updated = prevCats.map((c) => ({
            ...c,
            serviceCount: next.filter((j) => j.categoryId === c.id).length,
          }));
          persist(updated, next);
          return updated;
        });
        return next;
      });
    },
    [categories, persist],
  );

  // ─── Helpers ─────────────────────────────────────────────────

  const getJobsByCategory = useCallback(
    (categoryId: string) => jobs.filter((j) => j.categoryId === categoryId),
    [jobs],
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );

  const getJobById = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  const addRecentSearch = useCallback((term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    setRecentSearches((prev) => {
      const next = [t, ...prev.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
      AsyncStorage.setItem(SEARCH_KEY, JSON.stringify(next)).catch((e) =>
        console.error('Failed to persist recent searches:', e),
      );
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem(SEARCH_KEY).catch((e) => console.error('Failed to clear recent searches:', e));
  }, []);

  const resetToSeed = useCallback(() => {
    setCategories(SEED_CATEGORIES);
    setJobs(SEED_JOBS);
    persist(SEED_CATEGORIES, SEED_JOBS);
  }, [persist]);

  return useMemo(
    () => ({
      categories,
      jobs,
      isLoaded,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      updateCategory,
      addCategory,
      deleteCategory,
      updateJob,
      addJob,
      deleteJob,
      getJobsByCategory,
      getCategoryById,
      getJobById,
      resetToSeed,
    }),
    [
      categories,
      jobs,
      isLoaded,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      updateCategory,
      addCategory,
      deleteCategory,
      updateJob,
      addJob,
      deleteJob,
      getJobsByCategory,
      getCategoryById,
      getJobById,
      resetToSeed,
    ],
  );
});

function nextServiceCount(cats: ServiceCategory[], categoryId: string): number {
  return cats.find((c) => c.id === categoryId)?.serviceCount ?? 0;
}
