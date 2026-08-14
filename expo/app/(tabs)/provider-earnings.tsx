import { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { useProviderBookings, useTransactions, useProviderForUser, formatNLe } from '@/hooks/use-data';
import { useAuth } from '@/hooks/auth-store';

export default function ProviderEarningsScreen() {
  const accent = ROLE_ACCENT.PROVIDER;
  const { user } = useAuth();
  const { data: provider } = useProviderForUser(user?.id);
  const { data: bookings = [], refetch, isLoading } = useProviderBookings(provider?.id);
  const { data: txns = [] } = useTransactions(user?.id);

  const completed = useMemo(() => bookings.filter((b) => b.status === 'COMPLETED'), [bookings]);

  const gross = useMemo(() => completed.reduce((s, b) => s + b.finalPrice, 0), [completed]);
  const fees = useMemo(() => completed.reduce((s, b) => s + b.platformCommission + b.serviceFee, 0), [completed]);
  const net = useMemo(() => completed.reduce((s, b) => s + b.providerPayout, 0), [completed]);

  const pending = useMemo(
    () => bookings.filter((b) => ['ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(b.status)).reduce((s, b) => s + b.providerPayout, 0),
    [bookings],
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number; color: string }>();
    completed.forEach((b) => {
      const key = b.serviceJobName;
      const existing = map.get(key) ?? { name: key, count: 0, total: 0, color: b.serviceJobColor };
      existing.count += 1;
      existing.total += b.providerPayout;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [completed]);

  const maxCat = Math.max(1, ...byCategory.map((c) => c.total));

  return (
    <ScreenBackground variant="provider">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={accent.color} />}
        >
          {/* Net balance hero */}
          <View style={styles.heroCard}>
            <View style={[styles.heroGlow, { backgroundColor: accent.glow }]} />
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Net Earnings (All Time)</Text>
              <Text style={[styles.heroValue, { color: accent.color }]}>{formatNLe(net)}</Text>
              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Pending</Text>
                  <Text style={styles.heroStatValue}>{formatNLe(pending)}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Available</Text>
                  <Text style={styles.heroStatValue}>{formatNLe(Math.max(0, net - pending))}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payout Breakdown</Text>
            <View style={styles.breakdownCard}>
              <BreakdownRow label="Gross Earnings" value={formatNLe(gross)} color={COLORS.textPrimary} />
              <BreakdownRow label="Platform Commission" value={`- ${formatNLe(fees)}`} color={COLORS.error} />
              <View style={styles.breakdownDivider} />
              <BreakdownRow label="Net Payout" value={formatNLe(net)} color={accent.color} bold />
            </View>
          </View>

          {/* By category chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earnings by Service</Text>
            <View style={styles.chartCard}>
              {byCategory.length > 0 ? (
                byCategory.map((c) => (
                  <View key={c.name} style={styles.chartRow}>
                    <View style={styles.chartLabelRow}>
                      <View style={[styles.chartDot, { backgroundColor: c.color }]} />
                      <Text style={styles.chartName} numberOfLines={1}>{c.name}</Text>
                      <Text style={styles.chartValue}>{formatNLe(c.total)}</Text>
                    </View>
                    <View style={styles.chartBarBg}>
                      <View style={[styles.chartBarFill, { width: `${(c.total / maxCat) * 100}%`, backgroundColor: c.color }]} />
                    </View>
                    <Text style={styles.chartCount}>{c.count} jobs</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No completed jobs yet</Text>
              )}
            </View>
          </View>

          {/* Ledger */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Payouts</Text>
            <View style={styles.ledgerCard}>
              {txns.slice(0, 8).map((t, i) => (
                <View key={t.id}>
                  <View style={styles.ledgerRow}>
                    <View style={styles.ledgerIcon}>
                      <Ionicons name="cash-outline" size={16} color={accent.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ledgerDesc} numberOfLines={1}>{t.description}</Text>
                      <Text style={styles.ledgerDate}>
                        {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {t.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Africell Money'}
                      </Text>
                    </View>
                    <Text style={[styles.ledgerAmount, { color: accent.color }]}>{formatNLe(t.amount)}</Text>
                  </View>
                  {i < Math.min(7, txns.length - 1) && <View style={styles.ledgerDivider} />}
                </View>
              ))}
              {txns.length === 0 && <Text style={styles.emptyText}>No payouts yet</Text>}
            </View>
          </View>

          <View style={{ height: SPACING.xxl + 60 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function BreakdownRow({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && { fontWeight: '700', color: COLORS.textPrimary }]}>{label}</Text>
      <Text style={[styles.breakdownValue, { color, fontWeight: bold ? '800' : '600' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  heroCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg,
  },
  heroGlow: { ...StyleSheet.absoluteFillObject },
  heroContent: { padding: SPACING.lg, gap: SPACING.sm, position: 'relative', zIndex: 1 },
  heroLabel: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroValue: { fontSize: 36, fontWeight: '800' },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.md },
  heroStat: { flex: 1, gap: 2 },
  heroStatLabel: { fontSize: 11, color: COLORS.textTertiary },
  heroStatValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  heroDivider: { width: 1, height: 28, backgroundColor: COLORS.divider },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  breakdownCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder, gap: SPACING.sm },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { fontSize: 14, color: COLORS.textSecondary },
  breakdownValue: { fontSize: 14 },
  breakdownDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.xs },
  chartCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder, gap: SPACING.md },
  chartRow: { gap: 4 },
  chartLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  chartDot: { width: 8, height: 8, borderRadius: 4 },
  chartName: { flex: 1, fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  chartValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  chartBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  chartBarFill: { height: '100%', borderRadius: 3 },
  chartCount: { fontSize: 11, color: COLORS.textTertiary },
  ledgerCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  ledgerIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(34,229,255,0.12)', borderWidth: 1, borderColor: 'rgba(34,229,255,0.20)', justifyContent: 'center', alignItems: 'center' },
  ledgerDesc: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  ledgerDate: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  ledgerAmount: { fontSize: 15, fontWeight: '800' },
  ledgerDivider: { height: 1, backgroundColor: COLORS.divider },
  emptyText: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', paddingVertical: SPACING.md },
});
