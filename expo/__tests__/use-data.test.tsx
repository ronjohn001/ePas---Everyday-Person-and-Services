import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useBooking, useJob, useProvider, useProviderForUser } from '@/hooks/use-data';

/**
 * Regression tests for the "Query data cannot be undefined" crash:
 * React Query hard-fails any query function that resolves to undefined, so
 * single-row lookups must settle to null when the row does not exist.
 * These tests exercise the REAL hooks against a controllable Supabase mock.
 */

// ─── Controllable Supabase mock ──────────────────────────────────────────────

let mockSupabaseEnabled = true;
let mockRow: Record<string, unknown> | null = null;

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  get supabaseEnabled() {
    return mockSupabaseEnabled;
  },
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(async () => ({ data: mockRow, error: null })),
        })),
      })),
    })),
  },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const JOB_ROW: Record<string, unknown> = {
  id: 'job-1',
  category_id: 'cat-1',
  name: 'Plumbing Repair',
  description: 'Fix leaks and burst pipes',
  icon: 'water',
  color: '#4FC3F7',
  base_price: 250,
  assessment_fee: 50,
  estimated_duration: '1-2h',
  provider_ids: ['prov-1'],
};

const PROVIDER_ROW: Record<string, unknown> = {
  id: 'prov-1',
  user_id: 'user-9',
  name: 'Mariama Conteh',
  bio: 'Pro cleaner',
  experience_years: 6,
  approval_status: 'APPROVED',
  provider_tier: 'GOLD',
  overall_rating: 4.8,
  total_reviews: 23,
  completed_jobs: 45,
  badge_level: 'TOP_RATED',
  profile_photo: null,
  service_areas: ['Freetown'],
  service_category_ids: ['cat-1'],
  response_time: '~1h',
  verified: true,
};

// ─── Harness ─────────────────────────────────────────────────────────────────

/** Fresh QueryClient per test; retry off so a broken queryFn surfaces immediately. */
function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSupabaseEnabled = true;
  mockRow = null;
});

// ─── Supabase mode: missing row must resolve to null, never undefined ────────

describe('use-data lookups — missing rows (Supabase mode)', () => {
  it('useJob resolves null without error for an unknown job id', async () => {
    const { result } = await renderHook(() => useJob('no-such-job'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('useProvider resolves null without error for an unknown provider id', async () => {
    const { result } = await renderHook(() => useProvider('no-such-provider'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('useBooking resolves null without error for an unknown booking id', async () => {
    const { result } = await renderHook(() => useBooking('no-such-booking'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('useProviderForUser resolves null without error when the user has no provider profile', async () => {
    const { result } = await renderHook(() => useProviderForUser('customer-user'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });
});

// ─── Mock mode: same guarantee when falling back to bundled data ─────────────

describe('use-data lookups — missing rows (mock mode)', () => {
  beforeEach(() => {
    mockSupabaseEnabled = false;
  });

  it('useJob resolves null for an id not in the mock catalog', async () => {
    const { result } = await renderHook(() => useJob('no-such-job'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('useProvider resolves null for an id not in the mock catalog', async () => {
    const { result } = await renderHook(() => useProvider('no-such-provider'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('useBooking resolves null for an id not in the mock catalog', async () => {
    const { result } = await renderHook(() => useBooking('no-such-booking'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('useProviderForUser keeps its documented first-mock-provider fallback without erroring', async () => {
    const { result } = await renderHook(() => useProviderForUser('cust1'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeTruthy();
  });
});

// ─── Found rows still map correctly ──────────────────────────────────────────

describe('use-data lookups — found rows', () => {
  it('useJob maps a live Supabase row to the app model', async () => {
    mockRow = JOB_ROW;
    const { result } = await renderHook(() => useJob('job-1'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe('job-1');
    expect(result.current.data?.name).toBe('Plumbing Repair');
    expect(result.current.data?.basePrice).toBe(250);
  });

  it('useProvider maps a live Supabase row to the app model', async () => {
    mockRow = PROVIDER_ROW;
    const { result } = await renderHook(() => useProvider('prov-1'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe('Mariama Conteh');
    expect(result.current.data?.userId).toBe('user-9');
  });

  it('useProviderForUser finds a provider by user id', async () => {
    mockRow = PROVIDER_ROW;
    const { result } = await renderHook(() => useProviderForUser('user-9'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe('prov-1');
  });
});

// ─── Disabled lookups stay idle (undefined data is fine when nothing ran) ────

describe('use-data lookups — disabled state', () => {
  it('useJob with an undefined id never fetches and never errors', async () => {
    const { result } = await renderHook(() => useJob(undefined), { wrapper: makeWrapper() });

    expect(result.current.isFetched).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
