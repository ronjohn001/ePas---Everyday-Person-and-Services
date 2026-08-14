import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { BookingCalendar } from '@/components/BookingCalendar';
import { useAuth } from '@/hooks/auth-store';
import { useCustomerBookings, useProviderBookings, useProviderForUser } from '@/hooks/use-data';

const ACTIVE_STATUSES = ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'];

/** Shared calendar page — shows the signed-in customer's or trader's bookings. */
export default function CalendarScreen() {
  const { user, role } = useAuth();
  const isProvider = role === 'PROVIDER';
  const accent = isProvider ? ROLE_ACCENT.PROVIDER.color : COLORS.accent;

  const { data: provider } = useProviderForUser(isProvider ? user?.id : undefined);
  const customerQuery = useCustomerBookings(isProvider ? undefined : user?.id);
  const providerQuery = useProviderBookings(isProvider ? provider?.id : undefined);
  const activeQuery = isProvider ? providerQuery : customerQuery;
  const bookings = activeQuery.data ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const upcomingCount = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;

  // The auth gate can replace the stack — fall back to the role's home if there's no history.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(isProvider ? '/(tabs)/provider-dashboard' : '/(tabs)');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    activeQuery.refetch().finally(() => setRefreshing(false));
  };

  return (
    <ScreenBackground variant={isProvider ? 'provider' : 'default'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={goBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isProvider ? 'My Calendar' : 'Your Calendar'}</Text>
          <View style={[styles.countChip, { backgroundColor: `${accent}18`, borderColor: `${accent}40` }]}>
            <Text style={[styles.countText, { color: accent }]}>{upcomingCount} upcoming</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
        >
          <BookingCalendar bookings={bookings} accent={accent} viewerRole={isProvider ? 'PROVIDER' : 'CUSTOMER'} />
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
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
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
});
