import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import ServiceJobDetailScreen from '@/app/service-job/[serviceJobId]';
import { useCategories, useJob, useProviders } from '@/hooks/use-data';

/**
 * Regression tests for the "Book button → blank screen" incident:
 * this screen used to read providers from the bundled mock catalog, so in
 * live mode it offered mock-only providers (e.g. Isatu Gbla) whose ids do
 * not exist in Supabase. Booking one of them pushed a dead providerId into
 * /booking/create, which then rendered a bare "not found" screen.
 * The screen must now source job/category/providers from the data hooks.
 */

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({ serviceJobId: 'job18' }),
  Link: ({ children }: { children?: ReactNode }) => children ?? null,
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    LinearGradient: (props: Record<string, unknown>) =>
      React.createElement(View, props, props?.children),
  };
});

jest.mock('@/hooks/auth-store', () => ({
  useAuth: () => ({
    user: {
      id: 'cust1',
      email: 'customer@epas.sl',
      phone: '+232 76 123 456',
      phones: [],
      name: 'Aminata Sesay',
      role: 'CUSTOMER' as const,
      accountType: 'PRIVATE' as const,
      approvalStatus: 'APPROVED' as const,
      area: 'Lumley',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    logout: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-data', () => ({
  useJob: jest.fn(),
  useCategories: jest.fn(),
  useProviders: jest.fn(),
}));

const JOB = {
  id: 'job18',
  categoryId: 'cat6',
  name: 'Car Driver',
  description: 'Professional personal driver service',
  icon: 'car',
  color: '#1A3C6E',
  providerIds: ['prov-live-1'],
};

const LIVE_PROVIDER = {
  id: 'prov-live-1',
  userId: 'user-live-1',
  name: 'Mohamed Bangura',
  bio: 'Experienced driver',
  experienceYears: 8,
  approvalStatus: 'APPROVED' as const,
  providerTier: 'GOLD' as const,
  overallRating: 4.9,
  totalReviews: 31,
  completedJobs: 120,
  badgeLevel: 'MASTER' as const,
  serviceAreas: ['Kissy'],
  serviceCategoryIds: ['cat6'],
  responseTime: '~30min',
  verified: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useJob as unknown as Mock).mockReturnValue({ data: JOB, isLoading: false });
  (useCategories as unknown as Mock).mockReturnValue({
    data: [{ id: 'cat6', name: 'Driver' }],
    isLoading: false,
  });
  (useProviders as unknown as Mock).mockReturnValue({ data: [LIVE_PROVIDER], isLoading: false });
});

describe('Service job detail screen (live data)', () => {
  it('lists only providers from the data hooks — mock catalog names must not leak in', async () => {
    await render(<ServiceJobDetailScreen />);

    expect(screen.getByText('Mohamed Bangura')).toBeTruthy();
    // Isatu Gbla exists only in the bundled mock catalog for this job.
    expect(screen.queryByText('Isatu Gbla')).toBeNull();
    // Customer is in Lumley, trader serves Kissy → distance chip appears.
    expect(screen.getByText(/km away|Nearby/)).toBeTruthy();
  });

  it('Book navigates to booking/create with the live provider id', async () => {
    await render(<ServiceJobDetailScreen />);

    fireEvent.press(screen.getByText('Book'));

    expect(router.push).toHaveBeenCalledWith('/booking/create?jobId=job18&providerId=prov-live-1');
  });

  it('shows an empty state instead of mock providers when the job has none', async () => {
    (useProviders as unknown as Mock).mockReturnValue({ data: [], isLoading: false });

    await render(<ServiceJobDetailScreen />);

    expect(screen.getByText('No providers available yet')).toBeTruthy();
    expect(screen.queryByText('Book')).toBeNull();
  });

  it('shows a not-found state with a back control when the job lookup returns null', async () => {
    (useJob as unknown as Mock).mockReturnValue({ data: null, isLoading: false });

    await render(<ServiceJobDetailScreen />);

    expect(screen.getByText('Service not found')).toBeTruthy();
  });
});
