import { useAuth } from '@/hooks/auth-store';
import { router, Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { StatusBadge } from '@/components/StatusBadge';
import { useProviderBookings, useUpdateBookingStatus, useProviderForUser, formatNLe } from '@/hooks/use-data';
import type { Booking, BookingStatus } from '@/types';

type FilterKey = 'REQUESTS' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'REQUESTS', label: 'New Requests' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

const STATUS_FOR_FILTER: Record<FilterKey, BookingStatus[]> = {
  REQUESTS: ['REQUESTED'],
  SCHEDULED: ['ACCEPTED', 'EN_ROUTE'],
  IN_PROGRESS: ['IN_PROGRESS'],
  COMPLETED: ['COMPLETED', 'DECLINED', 'CANCELLED'],
};

const LIFECYCLE: Record<BookingStatus, { next?: BookingStatus; label?: string; icon?: string }[]> = {
  REQUESTED: [{ next: 'ACCEPTED', label: 'Accept', icon: 'checkmark' }, { next: 'DECLINED', label: 'Decline', icon: 'close' }],
  ACCEPTED: [{ next: 'EN_ROUTE', label: 'Mark En Route', icon: 'car' }],
  EN_ROUTE: [{ next: 'IN_PROGRESS', label: 'Start Job', icon: 'play' }],
  IN_PROGRESS: [{ next: 'COMPLETED', label: 'Complete', icon: 'checkmark-done' }],
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: [],
  DISPUTED: [],
};

export default function ProviderJobsScreen() {
  const { user } = useAuth();
  const accent = ROLE_ACCENT.PROVIDER;
  const { data: provider } = useProviderForUser(user?.id);
  const { data: bookings = [], refetch, isLoading } = useProviderBookings(provider?.id);
  const updateStatus = useUpdateBookingStatus();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('REQUESTS');

  const filtered = useMemo(
    () => bookings.filter((b) => STATUS_FOR_FILTER[activeFilter].includes(b.status)),
    [bookings, activeFilter],
  );

  const handleAction = (booking: Booking, next: BookingStatus, label: string) => {
    Alert.alert(label, `Update "${booking.serviceJobName}" to ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label,
        onPress: () =>
          updateStatus.mutate({ bookingId: booking.id, status: next }, {
            onError: (e) => Alert.alert('Error', (e as Error).message),
          }),
      },
    ]);
  };

  return (
    <ScreenBackground variant="provider">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jobs</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, activeFilter === f.key && { backgroundColor: accent.color, borderColor: accent.color }]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, activeFilter === f.key && { color: COLORS.textInverse }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={accent.color} />}
        >
          {filtered.length > 0 ? (
            <View style={styles.list}>
              {filtered.map((b) => (
                <View key={b.id}>
                  <Link href={`/booking/${b.id}`} asChild>
                    <TouchableOpacity style={styles.jobCard} activeOpacity={0.7}>
                      <View style={styles.jobTop}>
                        <View style={[styles.jobIcon, { backgroundColor: `${b.serviceJobColor}20`, borderColor: `${b.serviceJobColor}40` }]}>
                          <Ionicons name={b.serviceJobIcon as any} size={20} color={b.serviceJobColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.jobService}>{b.serviceJobName}</Text>
                          <Text style={styles.jobCustomer}>{b.customerName}</Text>
                          <Text style={styles.jobDate}>
                            {new Date(b.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {' · '}
                            {new Date(b.scheduledDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.jobAddress} numberOfLines={1}>{b.address}</Text>
                        </View>
                        <StatusBadge status={b.status} />
                      </View>
                      <View style={styles.jobBottom}>
                        <Text style={[styles.jobPrice, { color: accent.color }]}>{formatNLe(b.finalPrice)}</Text>
                        <Text style={styles.jobPayout}>Payout {formatNLe(b.providerPayout)}</Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                  {LIFECYCLE[b.status].length > 0 && (
                    <View style={styles.actionsRow}>
                      {LIFECYCLE[b.status].map((action) => (
                        <TouchableOpacity
                          key={action.label}
                          style={[
                            styles.actionBtn,
                            action.next === 'DECLINED'
                              ? { backgroundColor: 'rgba(255,92,122,0.08)', borderColor: 'rgba(255,92,122,0.30)' }
                              : { backgroundColor: accent.color, borderColor: accent.color },
                          ]}
                          onPress={() => action.next && handleAction(b, action.next, action.label ?? 'Confirm')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name={action.icon as any} size={14} color={action.next === 'DECLINED' ? COLORS.error : COLORS.textInverse} />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: action.next === 'DECLINED' ? COLORS.error : COLORS.textInverse },
                            ]}
                          >
                            {action.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="briefcase-outline" size={36} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No jobs in this stage</Text>
              <Text style={styles.emptyDesc}>Jobs will appear here as they progress</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  filterRow: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.md },
  filterTab: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  filterTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  listContent: { paddingHorizontal: SPACING.lg },
  list: { gap: SPACING.md },
  jobCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  jobTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  jobIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  jobService: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  jobCustomer: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  jobDate: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  jobAddress: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  jobBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.divider },
  jobPrice: { fontSize: 16, fontWeight: '800' },
  jobPayout: { fontSize: 12, color: COLORS.textTertiary },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, paddingHorizontal: SPACING.xs },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: RADIUS.md, gap: 6, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: SPACING.xxl * 2, gap: SPACING.md },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyDesc: { fontSize: 14, color: COLORS.textTertiary },
});
