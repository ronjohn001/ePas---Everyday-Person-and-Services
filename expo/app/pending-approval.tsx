import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/auth-store';
import { COLORS, SPACING, RADIUS, SHADOWS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import type { ApprovalStatus } from '@/types';

/**
 * Gate screen for accounts that are not yet admin-approved.
 * Shows the current review status and lets the user re-check it.
 */
export default function PendingApprovalScreen() {
  const { user, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const status: ApprovalStatus = user?.approvalStatus ?? 'PENDING';

  // Re-fetch the profile row; the root layout gate routes to the app once APPROVED.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const isRejected = status === 'REJECTED';
  const isSuspended = status === 'SUSPENDED';
  const isPending = status === 'PENDING';

  const statusColor = isPending ? COLORS.amber : isSuspended ? COLORS.error : COLORS.error;
  const statusBg = isPending ? 'rgba(255,184,64,0.12)' : 'rgba(255,92,122,0.12)';
  const statusBorder = isPending ? 'rgba(255,184,64,0.30)' : 'rgba(255,92,122,0.30)';
  const iconName = isPending ? 'hourglass-outline' : isSuspended ? 'pause-circle-outline' : 'close-circle-outline';
  const title = isPending ? 'Account Pending Review' : isSuspended ? 'Account Suspended' : 'Application Not Approved';
  const message = isPending
    ? 'An ePaS admin is reviewing your account. This usually takes less than 24 hours — pull down or tap below to check your status.'
    : isSuspended
      ? 'Your account has been suspended. If you believe this is a mistake, please contact ePaS support.'
      : 'Unfortunately your account application was not approved. Please contact ePaS support for more information.';

  return (
    <ScreenBackground variant="admin">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ePaS</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.accent} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconWrap}>
            <View style={[styles.iconGlow, { backgroundColor: statusBg }]} />
            <View style={[styles.iconCircle, { backgroundColor: statusBg, borderColor: statusBorder }]}>
              <Ionicons name={iconName} size={44} color={statusColor} />
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[styles.statusPill, { backgroundColor: statusBg, borderColor: statusBorder }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>Status: {status}</Text>
          </View>

          {user?.name ? (
            <View style={styles.accountCard}>
              <View style={styles.accountAvatar}>
                <Ionicons name="person" size={20} color={COLORS.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>{user.name}</Text>
                <Text style={styles.accountMeta}>{user.email || user.phone}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity style={styles.refreshBtn} onPress={refresh} disabled={refreshing} activeOpacity={0.8}>
            <Ionicons name="refresh" size={18} color={COLORS.textInverse} />
            <Text style={styles.refreshBtnText}>{refreshing ? 'Checking…' : 'Check Status'}</Text>
          </TouchableOpacity>

          <Text style={styles.supportText}>
            Need help? Contact support at <Text style={styles.supportEmail}>support@epas.sl</Text>
          </Text>
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  iconGlow: { ...StyleSheet.absoluteFillObject, transform: [{ scale: 1.6 }], borderRadius: 999 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.glowMagenta,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    alignSelf: 'stretch',
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  accountMeta: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ROLE_ACCENT.ADMIN.color,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    alignSelf: 'stretch',
  },
  refreshBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textInverse },
  supportText: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center' },
  supportEmail: { color: COLORS.textSecondary, fontWeight: '600' },
});
