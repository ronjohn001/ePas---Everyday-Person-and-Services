import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/colors';
import { SERVICE_AREA_NAMES, formatDistance, nearestAreaDistanceKm } from '@/constants/areas';
import { BackButton } from '@/components/BackButton';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useAuth } from '@/hooks/auth-store';
import { useCatalog } from '@/hooks/catalog-store';
import { useAllJobs, useCategories, useProviders, useSearchProviders } from '@/hooks/use-data';
import type { ProviderProfile } from '@/types';

/**
 * Dedicated full-screen search: its own input, recent searches, and
 * category/area filters. Opened from the Home search bar. The text search
 * itself still runs only when the customer submits the string — the filter
 * chips then refine the results live.
 */
export default function SearchScreen() {
  const { user } = useAuth();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useCatalog();

  const [query, setQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const { data: allJobs = [] } = useAllJobs();
  const { data: categories = [] } = useCategories();
  const { data: allProviders = [] } = useProviders();
  const { data: searchedProviders = [] } = useSearchProviders(submittedQuery);

  // Deep-linked with a term, e.g. /search?q=plumbing from Favourites
  useEffect(() => {
    if (typeof q === 'string' && q.trim().length > 0) {
      setQuery(q);
      setSubmittedQuery(q.trim());
    }
  }, [q]);

  const isSearching = submittedQuery.length > 0 || categoryId !== null || area !== null;
  const filtersActive = categoryId !== null || area !== null;

  const submitSearch = useCallback(() => {
    const term = query.trim();
    if (!term) return;
    setSubmittedQuery(term);
    addRecentSearch(term);
    Keyboard.dismiss();
  }, [query, addRecentSearch]);

  const runRecentSearch = useCallback((term: string) => {
    setQuery(term);
    setSubmittedQuery(term);
    addRecentSearch(term);
    Keyboard.dismiss();
  }, [addRecentSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSubmittedQuery('');
    setCategoryId(null);
    setArea(null);
  }, []);

  const filteredJobs = useMemo(() => {
    if (!isSearching) return [];
    const term = submittedQuery.toLowerCase();
    return allJobs
      .filter((j) => (!term || j.name.toLowerCase().includes(term) || j.description.toLowerCase().includes(term)))
      .filter((j) => !categoryId || j.categoryId === categoryId)
      .slice(0, 10);
  }, [isSearching, allJobs, submittedQuery, categoryId]);

  // Nearest traders first; distance = customer's area to the trader's nearest service area.
  const rankedProviders = useMemo(() => {
    if (!isSearching) return [] as { provider: ProviderProfile; distanceKm: number | null }[];
    const base = submittedQuery ? searchedProviders : allProviders;
    return base
      .filter((p) => !categoryId || p.serviceCategoryIds.includes(categoryId))
      .filter((p) => !area || p.serviceAreas.some((a) => a.trim().toLowerCase() === area.toLowerCase()))
      .map((p) => ({ provider: p, distanceKm: nearestAreaDistanceKm(user?.area, p.serviceAreas) }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .slice(0, 10);
  }, [isSearching, submittedQuery, searchedProviders, allProviders, categoryId, area, user?.area]);

  const hasResults = filteredJobs.length > 0 || rankedProviders.length > 0;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header — back + own search input */}
        <View style={styles.header}>
          <BackButton style={styles.backBtn} size={20} />
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services or traders..."
              placeholderTextColor={COLORS.textTertiary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={submitSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters — always available; tapping a chip on the landing view starts browsing */}
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Service</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <FilterChip label="All" active={categoryId === null} onPress={() => setCategoryId(null)} accessibilityLabel="Category filter: All" />
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                label={c.name}
                active={categoryId === c.id}
                onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
                accessibilityLabel={`Category filter: ${c.name}`}
              />
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Area</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <FilterChip label="Anywhere" active={area === null} onPress={() => setArea(null)} accessibilityLabel="Area filter: Anywhere" />
            {SERVICE_AREA_NAMES.map((a) => (
              <FilterChip
                key={a}
                label={a}
                active={area === a}
                onPress={() => setArea(area === a ? null : a)}
                accessibilityLabel={`Area filter: ${a}`}
              />
            ))}
          </ScrollView>
        </View>

        {isSearching ? (
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.bodyContent}>
            {filteredJobs.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.resultGroupTitle}>Services</Text>
                {filteredJobs.map((job) => {
                  const cat = categories.find((c) => c.id === job.categoryId);
                  return (
                    <TouchableOpacity
                      key={job.id}
                      style={styles.resultItem}
                      onPress={() => router.push(`/service-job/${job.id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.resultIcon, { backgroundColor: `${job.color}20`, borderColor: `${job.color}30` }]}>
                        <Ionicons name={job.icon as any} size={18} color={job.color} />
                      </View>
                      <View style={styles.resultTextWrap}>
                        <Text style={styles.resultName}>{job.name}</Text>
                        <Text style={styles.resultMeta}>{cat?.name ?? 'Service'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {rankedProviders.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.resultGroupTitle}>Traders</Text>
                {rankedProviders.map(({ provider: p, distanceKm }) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.resultItem}
                    onPress={() => router.push(`/provider/${p.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: 'rgba(34,229,255,0.12)', borderColor: 'rgba(34,229,255,0.25)' }]}>
                      <Ionicons name="person" size={18} color={COLORS.cyan} />
                    </View>
                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultName}>{p.name}</Text>
                      <Text style={styles.resultMeta}>
                        {p.serviceAreas.slice(0, 2).join(', ') || 'Trader'} · {p.overallRating.toFixed(1)}★
                      </Text>
                    </View>
                    {distanceKm !== null && (
                      <View style={styles.distanceChip}>
                        <Ionicons name="navigate" size={10} color={COLORS.accent} />
                        <Text style={styles.distanceChipText}>{formatDistance(distanceKm)}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!hasResults && (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="search" size={26} color={COLORS.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>
                  {submittedQuery ? `No matches for "${submittedQuery}"` : 'Nothing matches these filters'}
                </Text>
                <Text style={styles.emptySub}>Try different words, or widen the service and area filters.</Text>
                {filtersActive && (
                  <TouchableOpacity
                    style={styles.emptyClearBtn}
                    onPress={() => { setCategoryId(null); setArea(null); }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                  >
                    <Text style={styles.emptyClearText}>Clear filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.bodyContent}>
            {recentSearches.length > 0 && (
              <View style={styles.resultGroup}>
                <View style={styles.recentHeader}>
                  <Text style={styles.resultGroupTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches} hitSlop={8} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Clear recent searches">
                    <Text style={styles.recentClear}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((term) => (
                  <TouchableOpacity key={term} style={styles.resultItem} onPress={() => runRecentSearch(term)} activeOpacity={0.7}>
                    <View style={[styles.resultIcon, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: COLORS.glassBorder }]}>
                      <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.resultTextWrap}>
                      <Text style={styles.resultName}>{term}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.resultGroup}>
              <Text style={styles.resultGroupTitle}>Browse Categories</Text>
              <View style={styles.catGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.catCard}
                    onPress={() => router.push(`/category/${cat.id}`)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.catIcon, { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}30` }]}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                    <Text style={styles.catCount}>{cat.serviceCount} services</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function FilterChip({ label, active, onPress, accessibilityLabel }: { label: string; active: boolean; onPress: () => void; accessibilityLabel: string }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filters: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  filterLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  chipRow: {
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.lg,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  chipActive: {
    backgroundColor: 'rgba(0,255,163,0.14)',
    borderColor: 'rgba(0,255,163,0.45)',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipLabelActive: {
    color: COLORS.accent,
  },
  bodyContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  resultGroup: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  resultGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  resultTextWrap: { flex: 1 },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,255,163,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.25)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  distanceChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.accent,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.sm,
  },
  recentClear: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.accent,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  catCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    gap: 6,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  catCount: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyClearBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(0,255,163,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.4)',
  },
  emptyClearText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
