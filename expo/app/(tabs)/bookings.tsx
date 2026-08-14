import { useAuth } from '@/hooks/auth-store';
import { router, Link } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { useCustomerBookings, formatNLe } from '@/hooks/use-data';
import { StatusBadge } from '@/components/StatusBadge';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import type { BookingStatus } from '@/types';

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const ACTIVE_STATUSES: BookingStatus[] = ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'];
const CANCELLED_STATUSES: BookingStatus[] = ['DECLINED', 'CANCELLED', 'DISPUTED'];

export default function BookingsScreen() {
  const { user } = useAuth();
  const accent = ROLE_ACCENT.CUSTOMER.color;
  const { data: bookings = [], refetch, isLoading } = useCustomerBookings(user?.id);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'ACTIVE') return ACTIVE_STATUSES.includes(b.status);
      if (activeFilter === 'COMPLETED') return b.status === 'COMPLETED';
      if (activeFilter === 'CANCELLED') return CANCELLED_STATUSES.includes(b.status);
      return true;
    });
  }, [bookings, activeFilter]);

  const onRefresh = () => {
    refetch();
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
              <Ionicons name="filter-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <LogoutButton color={COLORS.textPrimary} />
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterTab, activeFilter === filter.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, activeFilter === filter.key && styles.filterTabTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bookings list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={accent} />}
        >
          {filteredBookings.length > 0 ? (
            <View style={styles.bookingsList}>
              {filteredBookings.map(booking => (
                <Link key={booking.id} href={`/booking/${booking.id}`} asChild>
                  <TouchableOpacity style={styles.bookingCard} activeOpacity={0.7}>
                    <View style={styles.bookingTop}>
                      <View style={[styles.bookingIcon, { backgroundColor: `${booking.serviceJobColor}20`, borderColor: `${booking.serviceJobColor}30` }]}>
                        <Ionicons name={booking.serviceJobIcon as any} size={20} color={booking.serviceJobColor} />
                      </View>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.bookingService}>{booking.serviceJobName}</Text>
                        <Text style={styles.bookingProvider}>{booking.providerName}</Text>
                        <Text style={styles.bookingDate}>
                          {new Date(booking.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <StatusBadge status={booking.status} />
                    </View>
                    <View style={styles.bookingBottom}>
                      <View style={styles.bookingMeta}>
                        <View style={styles.bookingMetaItem}>
                          <Ionicons
                            name="wallet"
                            size={12}
                            color={booking.paymentMethod === 'ORANGE_MONEY' ? COLORS.orangeMoney : COLORS.africellMoney}
                          />
                          <Text style={styles.bookingMetaText}>
                            {booking.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Africell Money'}
                          </Text>
                        </View>
                        <View style={styles.bookingMetaItem}>
                          <Ionicons name="location-outline" size={12} color={COLORS.textTertiary} />
                          <Text style={styles.bookingMetaText} numberOfLines={1}>{booking.address}</Text>
                        </View>
                      </View>
                      <Text style={styles.bookingPrice}>{formatNLe(booking.finalPrice)}</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={36} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyDesc}>Browse services and book your first provider</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)')} activeOpacity={0.82}>
                <Text style={styles.emptyBtnText}>Browse Services</Text>
              </TouchableOpacity>
            </View>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filterTabActive: {
    backgroundColor: COLORS.clientAccent,
    borderColor: COLORS.clientAccent,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.textInverse,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  bookingsList: {
    gap: SPACING.md,
  },
  bookingCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  bookingTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  bookingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  bookingInfo: { flex: 1, gap: 2 },
  bookingService: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bookingProvider: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bookingDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  bookingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  bookingMeta: {
    gap: 4,
  },
  bookingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingMetaText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.clientAccent,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  emptyBtn: {
    backgroundColor: COLORS.clientAccent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
