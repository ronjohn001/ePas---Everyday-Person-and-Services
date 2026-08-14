import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import type { ReactNode } from 'react';

import ProviderDashboardScreen from '@/app/(tabs)/provider-dashboard';
import { useReviewsForProvider } from '@/hooks/use-data';

// ─── Module mocks ────────────────────────────────────────────────────────────

const mockMutate = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  Link: ({ children }: { children?: ReactNode }) => children ?? null,
}));

jest.mock('@/hooks/auth-store', () => ({
  useAuth: () => ({
    user: {
      id: 'u-trader',
      email: 'trader@epas.sl',
      phone: '+232 77 000 000',
      phones: [],
      name: 'Musa Kamara',
      role: 'PROVIDER' as const,
      accountType: 'BUSINESS' as const,
      approvalStatus: 'APPROVED' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    logout: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-data', () => ({
  useProviderForUser: jest.fn(() => ({
    data: {
      id: 'prov1',
      userId: 'u-trader',
      name: 'Musa Kamara Electricals',
      bio: 'Certified electrician serving Freetown',
      experienceYears: 8,
      approvalStatus: 'APPROVED',
      providerTier: 'GOLD',
      overallRating: 4.8,
      totalReviews: 23,
      completedJobs: 45,
      badgeLevel: 'VERIFIED_PRO',
      serviceAreas: ['Freetown', 'Bo'],
      serviceCategoryIds: ['c1'],
      responseTime: '~1h',
      verified: true,
      portfolioPhotos: ['p1.jpg'],
      certifications: ['ECSL certified'],
    },
  })),
  useProviderBookings: jest.fn(() => ({
    data: [
      {
        id: 'b1',
        customerId: 'c1',
        customerName: 'Aminata Sesay',
        providerId: 'prov1',
        providerName: 'Musa Kamara Electricals',
        serviceJobId: 'j1',
        serviceJobName: 'AC Installation',
        serviceJobIcon: 'construct',
        serviceJobColor: '#4FC3F7',
        status: 'REQUESTED',
        bookingType: 'INSTANT',
        finalPrice: 1500,
        serviceFee: 0,
        platformCommission: 225,
        providerPayout: 1275,
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        address: '12 Main St, Freetown',
        paymentMethod: 'ORANGE_MONEY',
        paymentStatus: 'HELD_IN_ESCROW',
        createdAt: new Date().toISOString(),
        hasReview: false,
      },
      {
        id: 'b2',
        customerId: 'c2',
        customerName: 'Fatmata Bah',
        providerId: 'prov1',
        providerName: 'Musa Kamara Electricals',
        serviceJobId: 'j2',
        serviceJobName: 'Wiring Repair',
        serviceJobIcon: 'flash',
        serviceJobColor: '#FFB547',
        status: 'ACCEPTED',
        bookingType: 'INSTANT',
        finalPrice: 600,
        serviceFee: 0,
        platformCommission: 90,
        providerPayout: 510,
        scheduledDate: new Date().toISOString(),
        address: '5 Hill St, Freetown',
        paymentMethod: 'AFRICELL_MONEY',
        paymentStatus: 'HELD_IN_ESCROW',
        createdAt: new Date().toISOString(),
        hasReview: false,
      },
      {
        id: 'b3',
        customerId: 'c3',
        customerName: 'Ibrahim Conteh',
        providerId: 'prov1',
        providerName: 'Musa Kamara Electricals',
        serviceJobId: 'j3',
        serviceJobName: 'Socket Replacement',
        serviceJobIcon: 'build',
        serviceJobColor: '#00FFA3',
        status: 'COMPLETED',
        bookingType: 'INSTANT',
        finalPrice: 1000,
        serviceFee: 0,
        platformCommission: 150,
        providerPayout: 850,
        scheduledDate: new Date(Date.now() - 172800000).toISOString(),
        address: '8 King St, Freetown',
        paymentMethod: 'ORANGE_MONEY',
        paymentStatus: 'RELEASED',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        hasReview: true,
      },
    ],
    refetch: jest.fn(),
    isLoading: false,
  })),
  useReviewsForProvider: jest.fn(() => ({
    data: [
      {
        id: 'r1',
        bookingId: 'b3',
        customerId: 'c3',
        customerName: 'Ibrahim Conteh',
        providerId: 'prov1',
        timeliness: 5,
        professionalism: 5,
        quality: 5,
        communication: 5,
        overall: 5,
        comment: 'Excellent work',
        createdAt: new Date().toISOString(),
        status: 'VISIBLE',
      },
      {
        id: 'r2',
        bookingId: 'b9',
        customerId: 'c4',
        customerName: 'Adama Kamara',
        providerId: 'prov1',
        timeliness: 4,
        professionalism: 4,
        quality: 4,
        communication: 4,
        overall: 4,
        comment: 'Good job',
        createdAt: new Date().toISOString(),
        status: 'VISIBLE',
      },
    ],
  })),
  useUpdateBookingStatus: jest.fn(() => ({ mutate: mockMutate, isPending: false })),
  formatNLe: (n: number) => `NLe ${n.toLocaleString('en-US')}`,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockPush = router.push as unknown as Mock;
const mockUseReviewsForProvider = useReviewsForProvider as unknown as Mock;

async function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProviderDashboardScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Trader Dashboard', () => {
  it('renders header, My Activities and the Searches row with all panels closed', async () => {
    await renderDashboard();

    expect(screen.getByText('Hi, Musa')).toBeTruthy();
    expect(screen.getByText('Musa Kamara Electricals')).toBeTruthy();

    // My Activities tiles — Reviews tile reads aggregates from the profile
    expect(screen.getByText('My Activities')).toBeTruthy();
    expect(screen.getByText('Reviews')).toBeTruthy();
    expect(screen.getByText('4.8★ avg')).toBeTruthy();
    expect(screen.getByText('Requests')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Calendar')).toBeTruthy();

    // Searches toggle row, all panels collapsed
    expect(screen.getByText('Searches')).toBeTruthy();
    expect(screen.getByText('Performance')).toBeTruthy();
    expect(screen.getByText('Earnings')).toBeTruthy();
    expect(screen.getByText('History')).toBeTruthy();
    expect(screen.queryByText('Your Performance')).toBeNull();
    expect(screen.queryByText('Work History')).toBeNull();

    // Removed duplication: no inline Recent Reviews section anymore
    expect(screen.queryByText('Recent Reviews')).toBeNull();

    // The reviews query is deferred until the Performance panel is opened
    expect(mockUseReviewsForProvider).not.toHaveBeenCalled();
  });

  it('loads the Performance panel on demand with computed stats', async () => {
    await renderDashboard();
    await fireEvent.press(screen.getByText('Performance'));

    expect(mockUseReviewsForProvider).toHaveBeenCalledWith('prov1');
    expect(screen.getByText('Your Performance')).toBeTruthy();
    expect(screen.getByText('Jobs Done')).toBeTruthy();
    expect(screen.getByText('100% completion rate')).toBeTruthy();
    expect(screen.getByText('Acceptance')).toBeTruthy();
    expect(screen.getByText('2 of 2 requests')).toBeTruthy();
    expect(screen.getByText('Total Earned')).toBeTruthy();
    expect(screen.getByText('NLe 850 this month')).toBeTruthy();
    // Two mocked reviews → average 4.5, 100% positive
    expect(screen.getByText('4.5★ · 100% positive')).toBeTruthy();
  });

  it('switches from Performance to Earnings with weekly/monthly totals', async () => {
    await renderDashboard();
    await fireEvent.press(screen.getByText('Performance'));
    await fireEvent.press(screen.getByText('Earnings'));

    expect(screen.queryByText('Your Performance')).toBeNull();
    expect(screen.getByText('This Week')).toBeTruthy();
    expect(screen.getByText('This Month')).toBeTruthy();
    // b3 (NLe 850, completed yesterday) counts towards week and month, not today
    expect(screen.getByText('NLe 0')).toBeTruthy();
    expect(screen.getAllByText('NLe 850')).toHaveLength(2);
  });

  it('shows completed jobs in History and collapses on a second tap', async () => {
    await renderDashboard();
    await fireEvent.press(screen.getByText('History'));

    expect(screen.getByText('Work History')).toBeTruthy();
    expect(screen.getByText('Socket Replacement')).toBeTruthy();
    expect(screen.getByText('Ibrahim Conteh')).toBeTruthy();
    expect(screen.getByText(/Reviewed/)).toBeTruthy();

    await fireEvent.press(screen.getByText('All Jobs'));
    expect(mockPush).toHaveBeenCalledWith('/provider-jobs');

    await fireEvent.press(screen.getByText('History'));
    expect(screen.queryByText('Work History')).toBeNull();
  });

  it('accepts a booking request after confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await renderDashboard();

    await fireEvent.press(screen.getByText('Accept'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Accept request',
      expect.stringContaining('AC Installation'),
      expect.any(Array),
    );

    const buttons = (alertSpy.mock.calls[0]?.[2] ?? []) as { text: string; onPress?: () => void }[];
    buttons.find((b) => b.text === 'Accept')?.onPress?.();
    expect(mockMutate).toHaveBeenCalledWith(
      { bookingId: 'b1', status: 'ACCEPTED' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
    alertSpy.mockRestore();
  });

  it('declines a booking request after confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await renderDashboard();

    await fireEvent.press(screen.getByText('Decline'));
    const buttons = (alertSpy.mock.calls[0]?.[2] ?? []) as { text: string; onPress?: () => void }[];
    buttons.find((b) => b.text === 'Decline')?.onPress?.();
    expect(mockMutate).toHaveBeenCalledWith(
      { bookingId: 'b1', status: 'DECLINED' },
      expect.anything(),
    );
    alertSpy.mockRestore();
  });

  it("shows today's scheduled job in the agenda", async () => {
    await renderDashboard();
    expect(screen.getByText("Today's Agenda")).toBeTruthy();
    expect(screen.getByText('Wiring Repair')).toBeTruthy();
    expect(screen.getByText('Fatmata Bah')).toBeTruthy();
  });

  it('navigates via the My Activities tiles', async () => {
    await renderDashboard();
    await fireEvent.press(screen.getByText('Reviews'));
    expect(mockPush).toHaveBeenCalledWith('/provider-reviews');

    await fireEvent.press(screen.getByText('Requests'));
    expect(mockPush).toHaveBeenCalledWith('/provider-jobs');

    await fireEvent.press(screen.getByText('Calendar'));
    expect(mockPush).toHaveBeenCalledWith('/calendar');
  });

  it('minimises and expands the trader profile hero', async () => {
    await renderDashboard();
    expect(screen.getByText('Certified electrician serving Freetown')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Minimise profile'));
    expect(screen.queryByText('Certified electrician serving Freetown')).toBeNull();
    expect(screen.getByText('4.8★ · 23 reviews · 45 jobs')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Expand profile'));
    expect(screen.getByText('Certified electrician serving Freetown')).toBeTruthy();
  });
});
