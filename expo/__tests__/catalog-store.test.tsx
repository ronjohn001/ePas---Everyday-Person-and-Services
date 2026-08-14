import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { CatalogProvider, useCatalog } from '@/hooks/catalog-store';

const SEARCH_KEY = 'epas_recent_searches_v1';

function wrapper({ children }: { children: ReactNode }) {
  return <CatalogProvider>{children}</CatalogProvider>;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('Catalog store — recent searches', () => {
  it('adds searches newest-first and persists them', async () => {
    const { result } = await renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => result.current.addRecentSearch('plumber'));
    expect(result.current.recentSearches).toEqual(['plumber']);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SEARCH_KEY, JSON.stringify(['plumber']));

    await act(async () => result.current.addRecentSearch('electrician'));
    expect(result.current.recentSearches).toEqual(['electrician', 'plumber']);
  });

  it('dedupes case-insensitively and trims whitespace', async () => {
    const { result } = await renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => result.current.addRecentSearch('plumber'));
    await act(async () => result.current.addRecentSearch('  Plumber  '));

    expect(result.current.recentSearches).toEqual(['Plumber']);
  });

  it('ignores searches shorter than 2 characters', async () => {
    const { result } = await renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => result.current.addRecentSearch('a'));
    await act(async () => result.current.addRecentSearch('   '));

    expect(result.current.recentSearches).toEqual([]);
  });

  it('keeps at most 8 recent searches, newest first', async () => {
    const { result } = await renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      for (let i = 1; i <= 9; i++) {
        result.current.addRecentSearch(`term ${i}`);
      }
    });

    expect(result.current.recentSearches).toHaveLength(8);
    expect(result.current.recentSearches[0]).toBe('term 9');
    expect(result.current.recentSearches).not.toContain('term 1');
  });

  it('clears recent searches and removes the stored value', async () => {
    const { result } = await renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => result.current.addRecentSearch('plumber'));
    await act(async () => result.current.clearRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SEARCH_KEY);
  });

  it('loads persisted recent searches on mount', async () => {
    await AsyncStorage.setItem(SEARCH_KEY, JSON.stringify(['solar panel']));

    const { result } = await renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.recentSearches).toEqual(['solar panel']));
  });
});
