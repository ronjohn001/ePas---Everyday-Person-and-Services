import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useAuth } from '@/hooks/auth-store';
import { useCustomerBookings } from '@/hooks/use-data';
import { useCatalog } from '@/hooks/catalog-store';
import { BackButton } from '@/components/BackButton';

interface FavTrader {
  providerId: string;
  name: string;
  jobs: number;
  lastAt: string;
}

interface FavService {
  jobId: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  lastProviderId: string;
  lastProviderName: string;
}

/**
 * Favourites — shortcuts to the traders and services the customer has used or
 * searched for before. Traders/services are derived from booking history;
 * searches come from the catalog store's persisted recent-search list.
 */
export default function FavouritesScreen() {
  const { user } = useAuth();
  const { data: myBookings = [], refetch } = useCustomerBookings(user?.id);
  const { recentSearches, clearRecentSearches } = useCatalog();
  const [refreshing, setRefreshing] = useState(false);
  const traderAccent = ROLE_ACCENT.PROVIDER.color;

  // Traders booked before — unique by provider, most recently used first
  const favTraders = useMemo<FavTrader[]>(() => {
    const sorted = [...myBookings].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
    );
    const seen = new Map<string, FavTrader>();
    for (const b of sorted) {
      const existing = seen.get(b.providerId);
      if (existing) {
        existing.jobs += 1;
      } else {
        seen.set(b.providerId, { providerId: b.providerId, name: b.providerName, jobs: 1, lastAt: b.scheduledDate });
      }
    }
    return [...seen.values()];
  }, [myBookings]);

  // Services booked before — unique by job, most recently used first
  const favServices = useMemo<FavService[]>(() => {
    const sorted = [...myBookings].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
    );
    const seen = new Map<string, FavService>();
    for (const b of sorted) {
      const existing = seen.get(b.serviceJobId);
      if (existing) {
        existing.count += 1;
      } else {
        seen.set(b.serviceJobId, {
          jobId: b.serviceJobId,
          name: b.serviceJobName,
          icon: b.serviceJobIcon,
          color: b.serviceJobColor,
          count: 1,
          lastProviderId: b.providerId,
          lastProviderName: b.providerName,
        });
      }
    }
    return [...seen.values()];
  }, [myBookings]);

  const isEmpty = favTraders.length === 0 && favServices.length === 0 && recentSearches.length === 0;

  const onRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const runSearch = (term: string) => {
    router.push({ pathname: '/(tabs)', params: { search: term } });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <BackButton style={styles.iconBtn} size={20} />
          <Text style={styles.headerTitle}>Favourites</Text>
          <View style={styles.countChip}>
            <Ionicons name="heart" size={11} color={COLORS.magenta} />
            <Text style={styles.countText}>{favTraders.length}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {isEmpty ? (
            <View style={styles.emptyCard}>
              <Ionicons name="heart-outline" size={34} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No favourites yet</Text>
              <Text style={styles.emptyDesc}>
                Traders and services you book or search for will show up here for quick access.
              </Text>
            </View>
          ) : (
            <>
              {/* Recent searches — tap to re-run on Home */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <TouchableOpacity onPress={clearRecentSearches} hitSlop={8} activeOpacity={0.7}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chipsWrap}>
                    {recentSearches.map((term) => (
                      <TouchableOpacity
                        key={term}
                        style={styles.chip}
                        onPress={() => runSearch(term)}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="search" size={12} color={COLORS.sky} />
                        <Text style={styles.chipText} numberOfLines={1}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Traders used before */}
              {favTraders.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Traders You've Used</Text>
                  {favTraders.map((t) => (
                    <TouchableOpacity
                      key={t.providerId}
                      style={styles.row}
                      onPress={() => router.push(`/provider/${t.providerId}`)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.rowAvatar, { backgroundColor: `${traderAccent}14`, borderColor: `${traderAccent}30` }]}>
                        <Text style={[styles.rowInitials, { color: traderAccent }]}>
                          {t.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{t.name}</Text>
                        <Text style={styles.rowMeta}>
                          {t.jobs} job{t.jobs === 1 ? '' : 's'} · last {new Date(t.lastAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Services used before — one tap to book again */}
              {favServices.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Services You've Used</Text>
                  {favServices.map((s) => (
                    <TouchableOpacity
                      key={s.jobId}
                      style={styles.row}
                      onPress={() => router.push(`/booking/create?jobId=${s.jobId}&providerId=${s.lastProviderId}`)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.rowIcon, { backgroundColor: `${s.color}18`, borderColor: `${s.color}35` }]}>
                        <Ionicons name={s.icon as any} size={17} color={s.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{s.name}</Text>
                        <Text style={styles.rowMeta}>
                          {s.count}× booked · last by {s.lastProviderName}
                        </Text>
                      </View>
                      <View style={styles.bookAgainPill}>
                        <Ionicons name="refresh" size={11} color={COLORS.accent} />
                        <Text style={styles.bookAgainText}>Book again</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,77,141,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,141,0.28)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: { fontSize: 11.5, fontWeight: '700', color: COLORS.magenta },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  section: { marginTop: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  clearText: { fontSize: 12.5, fontWeight: '600', color: COLORS.textTertiary },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,195,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.25)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: '70%',
  },
  chipText: { fontSize: 12.5, fontWeight: '600', color: COLORS.sky },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInitials: { fontSize: 14, fontWeight: '800' },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  rowMeta: { fontSize: 11.5, color: COLORS.textTertiary, marginTop: 2 },
  bookAgainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,255,163,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.28)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bookAgainText: { fontSize: 11.5, fontWeight: '700', color: COLORS.accent },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginTop: SPACING.lg,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.xs },
  emptyDesc: { fontSize: 12.5, color: COLORS.textTertiary, textAlign: 'center', lineHeight: 18 },
});
