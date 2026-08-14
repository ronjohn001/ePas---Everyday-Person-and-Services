import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { LOYALTY, POINT_TRANSACTIONS } from '@/data/mock';
import type { PointType } from '@/types';
import { LogoutButton } from '@/components/LogoutButton';

const TYPE_CONFIG: Record<PointType, { color: string; icon: string; sign: string }> = {
  EARNED: { color: COLORS.green, icon: 'trending-up', sign: '+' },
  REDEEMED: { color: COLORS.warning, icon: 'trending-down', sign: '-' },
  BONUS: { color: '#9B59B6', icon: 'gift', sign: '+' },
};

export default function LoyaltyScreen() {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Points</Text>
        <LogoutButton color={COLORS.white} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <LinearGradient
          colors={[COLORS.navy, COLORS.navyLight]}
          style={styles.balanceCard}
        >
          <View style={styles.balanceTop}>
            <View style={styles.balanceIcon}>
              <Ionicons name="gift" size={28} color={COLORS.greenLight} />
            </View>
            <Text style={styles.balanceLabel}>Current Balance</Text>
          </View>
          <Text style={styles.balanceValue}>{LOYALTY.balance}</Text>
          <Text style={styles.balanceSub}>points available</Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>{LOYALTY.totalEarned}</Text>
              <Text style={styles.balanceStatLabel}>Total Earned</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>{LOYALTY.totalRedeemed}</Text>
              <Text style={styles.balanceStatLabel}>Total Redeemed</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={20} color={COLORS.navy} />
          </View>
          <Text style={styles.infoText}>
            Earn 1 point for every NLe 1 spent on completed bookings. Redeem points for discounts on future bookings.
          </Text>
        </View>

        {/* Transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points History</Text>
          <View style={styles.txnList}>
            {POINT_TRANSACTIONS.map(txn => {
              const config = TYPE_CONFIG[txn.type];
              return (
                <View key={txn.id} style={styles.txnItem}>
                  <View style={[styles.txnIcon, { backgroundColor: `${config.color}15` }]}>
                    <Ionicons name={config.icon as any} size={18} color={config.color} />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnDesc}>{txn.description}</Text>
                    <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                  </View>
                  <Text style={[styles.txnAmount, { color: config.color }]}>
                    {config.sign}{Math.abs(txn.amount)}
                  </Text>
                </View>
              );
            })}
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
  balanceCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(46,204,113,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceValue: {
    fontSize: 56,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  balanceSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  balanceStats: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.lg,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  balanceStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: `${COLORS.navy}08`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  infoIcon: {},
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: SPACING.lg,
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
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  txnDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
