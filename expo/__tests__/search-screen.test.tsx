import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import SearchScreen from '@/app/search';

/**
 * The dedicated full-screen search page: the text search runs only on submit,
 * recent searches re-run on tap, and category/area chips refine the
 * distance-ranked results live.
 */

let mockParams: { q?: string } = {};
const mockAddRecentSearch = jest.fn();
const mockClearRecentSearches = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => mockParams,
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
    role: 'CUSTOMER' as const,
    logout: jest.fn(),
  }),
}));

jest.mock('@/hooks/catalog-store', () => ({
  useCatalog: () => ({
    recentSearches: ['car wash', 'foday'],
    addRecentSearch: mockAddRecentSearch,
    clearRecentSearches: mockClearRecentSearches,
  }),
}));

const mockCategories = [
  { id: 'c1', name: 'Home Services', description: '', icon: 'water', color: '#4FC3F7', serviceCount: 2, sortOrder: 1 },
  { id: 'c2', name: 'Driving', description: '', icon: 'car', color: '#1A3C6E', serviceCount: 1, sortOrder: 2 },
];

const mockJobs = [
  { id: 'j1', categoryId: 'c1', name: 'Car Wash', description: 'Full valet wash', icon: 'water', color: '#4FC3F7', providerIds: ['p1'] },
  { id: 'j2', categoryId: 'c2', name: 'Car Driver', description: 'Personal driver hire', icon: 'car', color: '#1A3C6E', providerIds: ['p2'] },
];

const mockTraderBrookfields = {
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
};
const mockTraderKissy = {
  ...mockTraderBrookfields,
  id: 'p2',
  userId: 'u3',
  name: 'Marie Sesay',
  serviceAreas: ['Kissy'],
  serviceCategoryIds: ['c2'],
};

jest.mock('@/hooks/use-data', () => ({
  useCategories: jest.fn(() => ({ data: mockCategories, isLoading: false })),
  useAllJobs: jest.fn(() => ({ data: mockJobs, isLoading: false })),
  useProviders: jest.fn(() => ({ data: [mockTraderBrookfields, mockTraderKissy], isLoading: false })),
  useSearchProviders: jest.fn((q: string) => ({
    data: !q
      ? []
      : [mockTraderBrookfields, mockTraderKissy].filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase()),
        ),
    isLoading: false,
  })),
}));

const mockPush = router.push as unknown as Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
});

describe('Dedicated search screen', () => {
  it('shows recent searches and category browse until a search or filter starts', async () => {
    await render(<SearchScreen />);

    expect(screen.getByText('Recent Searches')).toBeTruthy();
    expect(screen.getByText('car wash')).toBeTruthy();
    expect(screen.getByText('foday')).toBeTruthy();
    expect(screen.getByText('Browse Categories')).toBeTruthy();
    // Filter chips are available already, but no result groups render yet
    expect(screen.getAllByText('Home Services').length).toBeGreaterThan(0);
    expect(screen.queryByText('Car Wash')).toBeNull();
    expect(screen.queryByText('Foday Koroma')).toBeNull();
  });

  it('runs the text search only on submit — never per keystroke', async () => {
    await render(<SearchScreen />);
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'car');

    // Typing alone must not run a search — the landing view stays put
    expect(screen.getByText('Recent Searches')).toBeTruthy();
    expect(screen.queryByText('Car Wash')).toBeNull();

    await fireEvent(input, 'submitEditing');
    expect(mockAddRecentSearch).toHaveBeenCalledWith('car');
    expect(screen.queryByText('Recent Searches')).toBeNull();
    expect(screen.getByText('Services')).toBeTruthy();
    expect(screen.getByText('Car Wash')).toBeTruthy();
    expect(screen.getByText('Car Driver')).toBeTruthy();
  });

  it('keeps the submitted results while typing until the search is resubmitted', async () => {
    await render(<SearchScreen />);
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'car');
    await fireEvent(input, 'submitEditing');
    expect(screen.getByText('Car Wash')).toBeTruthy();

    // Retyping without submitting must not change the results
    await fireEvent.changeText(input, 'foday');
    expect(screen.getByText('Car Wash')).toBeTruthy();
    expect(screen.queryByText('Foday Koroma')).toBeNull();

    await fireEvent(input, 'submitEditing');
    expect(screen.getByText('Foday Koroma')).toBeTruthy();
    expect(screen.queryByText('Car Wash')).toBeNull();
  });

  it('re-runs a recent search when tapped', async () => {
    await render(<SearchScreen />);
    await fireEvent.press(screen.getByText('foday'));

    expect(mockAddRecentSearch).toHaveBeenCalledWith('foday');
    expect(screen.getByText('Foday Koroma')).toBeTruthy();
    expect(screen.getByText('Traders')).toBeTruthy();
  });

  it('narrows service results with the category filter chips', async () => {
    await render(<SearchScreen />);
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'car');
    await fireEvent(input, 'submitEditing');
    expect(screen.getByText('Car Wash')).toBeTruthy();
    expect(screen.getByText('Car Driver')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Category filter: Driving'));
    expect(screen.queryByText('Car Wash')).toBeNull();
    expect(screen.getByText('Car Driver')).toBeTruthy();
  });

  it('browses traders by area without typing, with a distance chip from the customer area', async () => {
    await render(<SearchScreen />);
    await fireEvent.press(screen.getByLabelText('Area filter: Kissy'));

    expect(screen.getByText('Marie Sesay')).toBeTruthy();
    expect(screen.queryByText('Foday Koroma')).toBeNull();
    // Customer is in Lumley, trader serves Kissy → distance chip appears
    expect(screen.getByText(/km away|Nearby/)).toBeTruthy();
  });

  it('navigates to the service page or trader profile from results', async () => {
    await render(<SearchScreen />);
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'car');
    await fireEvent(input, 'submitEditing');
    await fireEvent.press(screen.getByText('Car Wash'));
    expect(mockPush).toHaveBeenCalledWith('/service-job/j1');

    await fireEvent.changeText(input, 'foday');
    await fireEvent(input, 'submitEditing');
    await fireEvent.press(screen.getByText('Foday Koroma'));
    expect(mockPush).toHaveBeenCalledWith('/provider/p1');
  });

  it('shows an empty state and can clear active filters from it', async () => {
    await render(<SearchScreen />);
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'zzzz');
    await fireEvent(input, 'submitEditing');

    expect(screen.getByText('No matches for "zzzz"')).toBeTruthy();
    expect(screen.queryByText('Clear filters')).toBeNull();

    // Adding a filter keeps it empty → the clear-filters escape hatch appears
    await fireEvent.press(screen.getByLabelText('Area filter: Kissy'));
    expect(screen.getByText('Clear filters')).toBeTruthy();
    await fireEvent.press(screen.getByText('Clear filters'));
    expect(screen.queryByText('Clear filters')).toBeNull();
    expect(screen.getByText('No matches for "zzzz"')).toBeTruthy();
  });

  it('runs immediately when deep-linked with a q param', async () => {
    mockParams = { q: 'foday' };
    await render(<SearchScreen />);

    expect(screen.getByPlaceholderText('Search services or traders...').props.value).toBe('foday');
    expect(screen.getByText('Foday Koroma')).toBeTruthy();
  });

  it('clears everything back to the landing view from the input clear button', async () => {
    await render(<SearchScreen />);
    const input = screen.getByPlaceholderText('Search services or traders...');
    await fireEvent.changeText(input, 'car');
    await fireEvent(input, 'submitEditing');
    expect(screen.getByText('Car Wash')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Clear search'));
    expect(screen.getByText('Recent Searches')).toBeTruthy();
    expect(screen.queryByText('Car Wash')).toBeNull();
  });

  it('clears the recent-search history', async () => {
    await render(<SearchScreen />);
    await fireEvent.press(screen.getByLabelText('Clear recent searches'));
    expect(mockClearRecentSearches).toHaveBeenCalled();
  });
});
