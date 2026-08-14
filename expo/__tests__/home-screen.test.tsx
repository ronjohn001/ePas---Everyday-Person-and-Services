import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import HomeScreen from '@/app/(tabs)/index';
import { useAllJobs, useCategories, useProviders } from '@/hooks/use-data';

// ─── Module mocks ────────────────────────────────────────────────────────────

let mockSearchParams: { search?: string } = {};
const mockAddRecentSearch = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockSearchParams,
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
      area: 'Lumley',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    logout: jest.fn(),
  }),
}));

jest.mock('@/hooks/ad-store', () => ({
  useAds: () => ({ activeAdverts: [] }),
}));

jest.mock('@/hooks/catalog-store', () => ({
  useCatalog: () => ({
    recentSearches: [],
    addRecentSearch: mockAddRecentSearch,
    clearRecentSearches: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-data', () => ({
  useCategories: jest.fn(() => ({ data: [], isLoading: false })),
  useAllJobs: jest.fn(() => ({
    data: [
      {
        id: 'j1',
        categoryId: 'c1',
        name: 'Plumbing Repair',
        description: 'Fix leaks and burst pipes',
        icon: 'water',
        color: '#4FC3F7',
        providerIds: ['p1'],
      },
    ],
    isLoading: false,
  })),
  useProviders: jest.fn(() => ({
    data: [
      {
        id: 'p1',
        userId: 'u2',
        name: 'Foday Koroma',
        bio: 'Pro plumber',
        experienceYears: 5,
        approvalStatus: 'APPROVED',
        providerTier: 'SILVER',
        overallRating: 4.6,
        totalReviews: 12,
        completedJobs: 34,
        badgeLevel: 'RISING_STAR',
        serviceAreas: ['Brookfields'],
        serviceCategoryIds: ['c1'],
        responseTime: '~2h',
        verified: true,
      },
    ],
    isLoading: false,
  })),
  useSearchProviders: jest.fn(() => ({
    data: [
      {
        id: 'p1',
        userId: 'u2',
        name: 'Foday Koroma',
        bio: 'Pro plumber',
        experienceYears: 5,
        approvalStatus: 'APPROVED',
        providerTier: 'SILVER',
        overallRating: 4.6,
        totalReviews: 12,
        completedJobs: 34,
        badgeLevel: 'RISING_STAR',
        serviceAreas: ['Brookfields'],
        serviceCategoryIds: ['c1'],
        responseTime: '~2h',
        verified: true,
      },
    ],
  })),
  useCustomerBookings: jest.fn(() => ({
    data: [
      {
        id: 'b1',
        customerId: 'cust1',
        customerName: 'Aminata Sesay',
        providerId: 'p1',
        providerName: 'Foday Koroma',
        serviceJobId: 'j1',
        serviceJobName: 'Plumbing Repair',
        serviceJobIcon: 'water',
        serviceJobColor: '#4FC3F7',
        status: 'REQUESTED',
        bookingType: 'INSTANT',
        finalPrice: 250,
        serviceFee: 0,
        platformCommission: 37.5,
        providerPayout: 212.5,
        scheduledDate: '2026-08-20T10:00:00.000Z',
        address: '12 Main St',
        paymentMethod: 'ORANGE_MONEY',
        paymentStatus: 'HELD_IN_ESCROW',
        createdAt: '2026-08-14T09:00:00.000Z',
        hasReview: false,
      },
      {
        id: 'b2',
        customerId: 'cust1',
        customerName: 'Aminata Sesay',
        providerId: 'p1',
        providerName: 'Foday Koroma',
        serviceJobId: 'j1',
        serviceJobName: 'Plumbing Repair',
        serviceJobIcon: 'water',
        serviceJobColor: '#4FC3F7',
        status: 'COMPLETED',
        bookingType: 'INSTANT',
        finalPrice: 250,
        serviceFee: 0,
        platformCommission: 37.5,
        providerPayout: 212.5,
        scheduledDate: '2026-08-10T10:00:00.000Z',
        address: '12 Main St',
        paymentMethod: 'ORANGE_MONEY',
        paymentStatus: 'RELEASED',
        createdAt: '2026-08-09T09:00:00.000Z',
        completedAt: '2026-08-10T12:00:00.000Z',
        hasReview: false,
      },
    ],
  })),
  useLoyalty: jest.fn(() => ({ data: { balance: 120, totalEarned: 200, totalRedeemed: 80 } })),
  useReviewsByCustomer: jest.fn(() => ({ data: [] })),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockPush = router.push as unknown as Mock;
const mockUseCategories = useCategories as unknown as Mock;
const mockUseAllJobs = useAllJobs as unknown as Mock;
const mockUseProviders = useProviders as unknown as Mock;

async function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <HomeScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = {};
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Customer Home', () => {
  it('renders greeting, activity shortcuts and the Searches row with all panels closed', async () => {
    await renderHome();

    expect(screen.getByText('Hello, Aminata')).toBeTruthy();
    expect(screen.getByText('Customer')).toBeTruthy();

    // Activity shortcut tiles with live summaries
    expect(screen.getByText('My Bookings')).toBeTruthy();
    expect(screen.getByText('1 active')).toBeTruthy();
    expect(screen.getByText('Calendar')).toBeTruthy();
    expect(screen.getByText('Reviews')).toBeTruthy();
    expect(screen.getByText('1 to rate')).toBeTruthy();
    expect(screen.getByText('Favourite')).toBeTruthy();

    // Searches toggle row
    expect(screen.getByText('Searches')).toBeTruthy();
    expect(screen.getByText('Categories')).toBeTruthy();
    expect(screen.getByText('Top Traders')).toBeTruthy();
    expect(screen.getByText('Popular')).toBeTruthy();

    // Panels stay unmounted until a button is tapped
    expect(screen.queryByText('Browse Categories')).toBeNull();
    expect(screen.queryByText('Top Rated Traders')).toBeNull();
    expect(screen.queryByText('Popular Services')).toBeNull();
  });

  it('does not fetch panel data until the matching button is tapped', async () => {
    await renderHome();
    expect(mockUseCategories).not.toHaveBeenCalled();
    expect(mockUseProviders).not.toHaveBeenCalled();
    expect(mockUseAllJobs).not.toHaveBeenCalled();
  });

  it('expands the Categories panel on tap and collapses it on a second tap', async () => {
    await renderHome();
    await fireEvent.press(screen.getByText('Categories'));

    expect(mockUseCategories).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Browse Categories')).toBeTruthy();
    expect(screen.getByText('0 services')).toBeTruthy();

    await fireEvent.press(screen.getByText('Categories'));
    expect(screen.queryByText('Browse Categories')).toBeNull();
  });

  it('switches between Searches panels', async () => {
    await renderHome();
    await fireEvent.press(screen.getByText('Categories'));
    expect(screen.getByText('Browse Categories')).toBeTruthy();

    await fireEvent.press(screen.getByText('Top Traders'));
    expect(screen.queryByText('Browse Categories')).toBeNull();
    expect(screen.getByText('Top Rated Traders')).toBeTruthy();
    expect(screen.getByText('Foday Koroma')).toBeTruthy();
    expect(screen.getByText('34 jobs completed')).toBeTruthy();

    await fireEvent.press(screen.getByText('Popular'));
    expect(screen.queryByText('Top Rated Traders')).toBeNull();
    expect(screen.getByText('Popular Services')).toBeTruthy();
    expect(screen.getByText('Plumbing Repair')).toBeTruthy();
    expect(mockUseAllJobs).toHaveBeenCalled();
  });

  it('minimises and expands the profile hero', async () => {
    await renderHome();
    expect(screen.getByText('120 loyalty points')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Minimise profile'));
    expect(screen.queryByText('120 loyalty points')).toBeNull();
    expect(screen.getByText(/120 pts/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Expand profile'));
    expect(screen.getByText('120 loyalty points')).toBeTruthy();
  });

  it('navigates via the activity shortcut tiles', async () => {
    await renderHome();
    await fireEvent.press(screen.getByText('My Bookings'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/bookings');

    await fireEvent.press(screen.getByText('Calendar'));
    expect(mockPush).toHaveBeenCalledWith('/calendar');

    await fireEvent.press(screen.getByText('Reviews'));
    expect(mockPush).toHaveBeenCalledWith('/my-reviews');

    await fireEvent.press(screen.getByText('Favourite'));
    expect(mockPush).toHaveBeenCalledWith('/favourites');
  });

  it('only searches once the string is submitted — never on each keystroke', async () => {
    await renderHome();
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'plumb');

    // Typing alone must not run a search: discovery sections stay put
    expect(screen.getByText('Searches')).toBeTruthy();
    expect(screen.queryByText('Services')).toBeNull();

    await fireEvent(input, 'submitEditing');
    expect(screen.queryByText('Searches')).toBeNull();
    expect(screen.getByText('Services')).toBeTruthy();
    expect(screen.getByText('Plumbing Repair')).toBeTruthy();
    expect(screen.getByText('Traders')).toBeTruthy();

    await fireEvent.press(screen.getByText('Foday Koroma'));
    expect(mockAddRecentSearch).toHaveBeenCalledWith('plumb');

    // Selection clears the query and restores the discovery sections
    expect(screen.getByText('Searches')).toBeTruthy();
  });

  it("shows the trader's distance from the customer's area in search results", async () => {
    await renderHome();
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'foday');
    await fireEvent(input, 'submitEditing');

    // Customer is in Lumley, trader serves Brookfields → distance chip appears
    expect(screen.getByText(/km away|Nearby/)).toBeTruthy();
  });

  it('pre-fills the search bar when deep-linked with a search term', async () => {
    mockSearchParams = { search: 'plumb' };
    await renderHome();

    expect(screen.getByPlaceholderText('Search services or traders...').props.value).toBe('plumb');
    expect(screen.getByText('Plumbing Repair')).toBeTruthy();
  });
});
