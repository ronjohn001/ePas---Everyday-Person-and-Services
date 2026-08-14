import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import CreateBookingScreen from '@/app/booking/create';
import { useCreateBooking, useJob, useProvider } from '@/hooks/use-data';

/**
 * Screen-level guard for the "Query data cannot be undefined" incident:
 * when the job/provider lookups come back empty, the screen must render its
 * graceful not-found state instead of crashing.
 */

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({ jobId: 'job-1', providerId: 'prov-1' }),
  Link: ({ children }: { children?: ReactNode }) => children ?? null,
}));

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
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    logout: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-data', () => ({
  useJob: jest.fn(),
  useProvider: jest.fn(),
  useCreateBooking: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

const JOB = {
  id: 'job-1',
  categoryId: 'cat-1',
  name: 'Plumbing Repair',
  description: 'Fix leaks and burst pipes',
  icon: 'water',
  color: '#4FC3F7',
  basePrice: 250,
  assessmentFee: 50,
  estimatedDuration: '1-2h',
  providerIds: ['prov-1'],
};

const PROVIDER = {
  id: 'prov-1',
  userId: 'user-9',
  name: 'Mariama Conteh',
  bio: 'Pro cleaner',
  experienceYears: 6,
  approvalStatus: 'APPROVED' as const,
  providerTier: 'GOLD' as const,
  overallRating: 4.8,
  totalReviews: 23,
  completedJobs: 45,
  badgeLevel: 'TOP_RATED' as const,
  serviceAreas: ['Freetown'],
  serviceCategoryIds: ['cat-1'],
  responseTime: '~1h',
  verified: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: both lookups come back empty — the reported crash scenario.
  (useJob as unknown as Mock).mockReturnValue({ data: null, isLoading: false });
  (useProvider as unknown as Mock).mockReturnValue({ data: null, isLoading: false });
});

describe('Create booking screen', () => {
  it('shows a graceful not-found state when lookups return null instead of crashing', async () => {
    await render(<CreateBookingScreen />);

    expect(screen.getByText('Booking information not found')).toBeTruthy();
  });

  it('renders the booking summary when both lookups resolve', async () => {
    (useJob as unknown as Mock).mockReturnValue({ data: JOB, isLoading: false });
    (useProvider as unknown as Mock).mockReturnValue({ data: PROVIDER, isLoading: false });

    await render(<CreateBookingScreen />);

    expect(screen.getByText('New Booking')).toBeTruthy();
    expect(screen.getByText('Plumbing Repair')).toBeTruthy();
    expect(screen.getByText('Mariama Conteh')).toBeTruthy();
  });

  it('navigates straight to the new booking on success — not gated behind a native alert', async () => {
    (useJob as unknown as Mock).mockReturnValue({ data: JOB, isLoading: false });
    (useProvider as unknown as Mock).mockReturnValue({ data: PROVIDER, isLoading: false });

    let successCb: ((b: { id: string }) => void) | undefined;
    (useCreateBooking as unknown as Mock).mockReturnValue({
      mutate: jest.fn((_vars: unknown, opts: { onSuccess?: (b: { id: string }) => void }) => {
        successCb = opts?.onSuccess;
      }),
      isPending: false,
    });

    await render(<CreateBookingScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('Enter full address'), '12 Main Street, Freetown');
    await fireEvent.press(screen.getByText('Confirm Booking'));

    expect(successCb).toBeDefined();
    // Alert.alert is a no-op on web: the old flow only navigated from its OK
    // button, so the user was stranded after a successful booking.
    successCb?.({ id: 'bk_new' });
    expect(router.replace).toHaveBeenCalledWith('/booking/bk_new');
  });
});
