import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { TRANSACTIONS, formatNLe } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';
import type { PaymentStatus } from '@/types';

const STATUS_CONFIG: Record<PaymentStatus, { color: string; label: string }> = {
  PENDING: { color: COLORS.warning, label: 'Pending' },
  HELD_IN_ESCROW: { color: COLORS.info, label: 'In Escrow' },
  RELEASED: { color: COLORS.green, label: 'Released' },
  REFUNDED: { color: COLORS.error, label: 'Refunded' },
};

type FilterTab = 'ALL' | 'RELEASED' | 'HELD_IN_ESCROW' | 'PENDING';

export default function TransactionsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter(t => {
      if (activeFilter !== 'ALL' && t.status !== activeFilter) return false;
      if (searchQuery.trim() && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [activeFilter, searchQuery]);

  const totalSpent = TRANSACTIONS.filter(t => t.status === 'RELEASED').reduce((sum, t) => sum + t.amount, 0);
  const inEscrow = TRANSACTIONS.filter(t => t.status === 'HELD_IN_ESCROW').reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton style={styles.backBtn} />
        <Text style={styles.headerTitle}>Transactions</Text>
        <LogoutButton color={COLORS.textPrimary} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>{formatNLe(totalSpent)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>In Escrow</Text>
            <Text style={[styles.summaryValue, { color: COLORS.info }]}>{formatNLe(inEscrow)}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['ALL', 'RELEASED', 'HELD_IN_ESCROW', 'PENDING'] as FilterTab[]).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                {filter === 'ALL' ? 'All' : STATUS_CONFIG[filter].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions list */}
        <View style={styles.txnSection}>
          {filtered.map(txn => {
            const config = STATUS_CONFIG[txn.status];
            return (
              <View key={txn.id} style={styles.txnCard}>
                <View style={styles.txnLeft}>
                  <View style={[styles.txnIcon, { backgroundColor: `${COLORS.navy}10` }]}>
                    <Ionicons
                      name={txn.paymentMethod === 'ORANGE_MONEY' ? 'cash' : 'cash'}
                      size={18}
                      color={txn.paymentMethod === 'ORANGE_MONEY' ? COLORS.orangeMoney : COLORS.africellMoney}
                    />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnDesc} numberOfLines={1}>{txn.description}</Text>
                    <Text style={styles.txnDate}>
                      {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {txn.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Africell Money'}
                    </Text>
                    <View style={[styles.txnStatusPill, { backgroundColor: `${config.color}15` }]}>
                      <View style={[styles.txnStatusDot, { backgroundColor: config.color }]} />
                      <Text style={[styles.txnStatusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.txnAmount}>{formatNLe(txn.amount)}</Text>
              </View>
            );
          })}
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 4,
  },
  searchWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.cardBg,
  },
  filterTabActive: {
    backgroundColor: COLORS.navy,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  txnSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: { flex: 1 },
  txnDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  txnDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  txnStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginTop: 6,
  },
  txnStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  txnStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
});
