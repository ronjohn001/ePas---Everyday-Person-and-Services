import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ADMIN_REVENUE, formatNLe } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';

export default function AdminRevenueScreen() {
  const stats = [
    { label: 'Total Revenue', value: formatNLe(ADMIN_REVENUE.totalRevenue), icon: 'cash', color: COLORS.navy },
    { label: 'Commission', value: formatNLe(ADMIN_REVENUE.commissionEarned), icon: 'trending-up', color: COLORS.green },
    { label: 'Active Bookings', value: `${ADMIN_REVENUE.activeBookings}`, icon: 'calendar', color: COLORS.info },
    { label: 'Completed', value: `${ADMIN_REVENUE.completedBookings}`, icon: 'checkmark-done', color: COLORS.green },
    { label: 'Total Users', value: `${ADMIN_REVENUE.totalUsers}`, icon: 'people', color: '#9B59B6' },
    { label: 'Providers', value: `${ADMIN_REVENUE.totalProviders}`, icon: 'briefcase', color: COLORS.warning },
  ];

  const chartData = [35, 52, 48, 67, 55, 78, 82, 71, 90, 85, 95, 88];
  const maxVal = Math.max(...chartData);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton style={styles.backBtn} color={COLORS.white} />
        <Text style={styles.headerTitle}>Revenue Dashboard</Text>
        <LogoutButton color={COLORS.white} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        {/* Growth banner */}
        <View style={styles.growthBanner}>
          <View style={styles.growthIcon}>
            <Ionicons name="trending-up" size={24} color={COLORS.green} />
          </View>
          <View>
            <Text style={styles.growthLabel}>Monthly Growth</Text>
            <Text style={styles.growthValue}>+{ADMIN_REVENUE.monthlyGrowth}%</Text>
          </View>
          <View style={styles.growthPeriod}>
            <Text style={styles.growthPeriodText}>vs last month</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Monthly Revenue (NLe)</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {chartData.map((val, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <View style={styles.chartBarBg}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(val / maxVal) * 100}%`,
                          backgroundColor: i === chartData.length - 1 ? COLORS.green : COLORS.navy,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartMonth}>{months[i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.txnList}>
            {ADMIN_REVENUE.recentTransactions.map(txn => (
              <View key={txn.id} style={styles.txnItem}>
                <View style={[styles.txnIcon, { backgroundColor: `${COLORS.navy}10` }]}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.navy} />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnDesc} numberOfLines={1}>{txn.description}</Text>
                  <Text style={styles.txnDate}>
                    {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {' · '}
                    {txn.paymentMethod === 'ORANGE_MONEY' ? 'Orange' : 'Africell'}
                  </Text>
                </View>
                <Text style={styles.txnAmount}>{formatNLe(txn.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  growthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  growthIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.green}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  growthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.green,
  },
  growthPeriod: {
    marginLeft: 'auto',
  },
  growthPeriodText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  chartSection: {
    marginTop: SPACING.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    gap: 4,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBarBg: {
    width: '100%',
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartMonth: {
    fontSize: 10,
    color: COLORS.textTertiary,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  txnList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: { flex: 1 },
  txnDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  txnDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
});
