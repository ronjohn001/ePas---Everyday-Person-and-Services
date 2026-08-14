import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { SUBSCRIPTIONS, formatNLe } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';
import type { SubscriptionTier } from '@/types';

const TIER_CONFIG: Record<SubscriptionTier, { color: string; icon: string; gradient: [string, string] }> = {
  BRONZE: { color: '#CD7F32', icon: 'medal', gradient: ['#CD7F32', '#B8732B'] },
  SILVER: { color: '#C0C0C0', icon: 'shield', gradient: ['#A8A8A8', '#707070'] },
  GOLD: { color: '#D4AF37', icon: 'trophy', gradient: ['#D4AF37', '#F1C40F'] },
};

export default function SubscriptionsScreen() {
  const handleUpgrade = (tier: SubscriptionTier, fee: number) => {
    Alert.alert(
      `Upgrade to ${tier}`,
      `You will be charged ${formatNLe(fee)}/month. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => Alert.alert('Success!', `You are now a ${tier} member!`) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <LogoutButton color={COLORS.textPrimary} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        <Text style={styles.intro}>Choose a plan that works for you. Upgrade or cancel anytime.</Text>

        <View style={styles.tiersList}>
          {SUBSCRIPTIONS.map(sub => {
            const config = TIER_CONFIG[sub.tier];
            return (
              <View
                key={sub.tier}
                style={[styles.tierCard, sub.isActive && styles.tierCardActive]}
              >
                <View style={[styles.tierHeader, { backgroundColor: config.gradient[0] }]}>
                  <View style={styles.tierHeaderContent}>
                    <View style={styles.tierIconWrap}>
                      <Ionicons name={config.icon as any} size={24} color={COLORS.white} />
                    </View>
                    <View>
                      <Text style={styles.tierName}>{sub.tier}</Text>
                      <Text style={styles.tierFee}>{formatNLe(sub.monthlyFee)}/month</Text>
                    </View>
                  </View>
                  {sub.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                <View style={styles.tierBody}>
                  <View style={styles.benefitsList}>
                    {sub.benefits.map((benefit, i) => (
                      <View key={i} style={styles.benefitRow}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  {sub.isActive ? (
                    <View style={styles.activeInfo}>
                      <Text style={styles.activeInfoText}>
                        Renews on {new Date(sub.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.upgradeBtn, { backgroundColor: config.color }]}
                      onPress={() => handleUpgrade(sub.tier, sub.monthlyFee)}
                    >
                      <Text style={styles.upgradeBtnText}>Upgrade to {sub.tier}</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  intro: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingVertical: SPACING.lg,
    lineHeight: 20,
  },
  tiersList: {
    gap: SPACING.md,
  },
  tierCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tierCardActive: {
    borderColor: COLORS.green,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  tierHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  tierIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  tierFee: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  tierBody: {
    padding: SPACING.lg,
  },
  benefitsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  activeInfo: {
    backgroundColor: `${COLORS.green}10`,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeInfoText: {
    fontSize: 13,
    color: COLORS.green,
    fontWeight: '600',
  },
  upgradeBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
