import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';
import { Badge } from '@/components/Badge';
import { RatingStars } from '@/components/RatingStars';
import {
  usePendingProviders,
  useProviders,
  useCategories,
  useSetProviderApproval,
} from '@/hooks/use-data';
import type { ApprovalStatus, ProviderProfile } from '@/types';

/** Manage Traders — approval queue (approve/reject) + approved list (suspend). */
export default function AdminTradersScreen() {
  const accent = ROLE_ACCENT.ADMIN;
  const { data: pending = [], refetch, isLoading } = usePendingProviders();
  const { data: approved = [] } = useProviders();
  const { data: categories = [] } = useCategories();
  const approval = useSetProviderApproval();
  const [tab, setTab] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = (provider: ProviderProfile, status: ApprovalStatus) => {
    const verb = status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? 'Reject' : 'Suspend';
    const body =
      status === 'APPROVED'
        ? `${provider.name} will go live and customers can book them.`
        : status === 'REJECTED'
          ? `${provider.name}'s application will be rejected.`
          : `${provider.name} will be hidden from customers until reinstated.`;
    Alert.alert(`${verb} trader`, body, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: verb,
        style: status === 'APPROVED' ? 'default' : 'destructive',
        onPress: () => {
          setBusyId(provider.id);
          approval.mutate(
            { providerId: provider.id, status },
            {
              onSettled: () => setBusyId(null),
              onError: (e) => Alert.alert('Error', (e as Error).message),
            },
          );
        },
      },
    ]);
  };

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  return (
    <ScreenBackground variant="admin">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <BackButton size={24} />
          <Text style={styles.headerTitle}>Manage Traders</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'PENDING' && { backgroundColor: accent.color, borderColor: accent.color }]}
            onPress={() => setTab('PENDING')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'PENDING' && { color: COLORS.textInverse }]}>
              Pending ({pending.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'APPROVED' && { backgroundColor: accent.color, borderColor: accent.color }]}
            onPress={() => setTab('APPROVED')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'APPROVED' && { color: COLORS.textInverse }]}>
              Approved ({approved.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={accent.color} />}
        >
          {tab === 'PENDING' ? (
            pending.length > 0 ? (
              <View style={styles.list}>
                {pending.map((p) => (
                  <View key={p.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color={COLORS.textTertiary} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.name}>{p.name}</Text>
                        {!!p.bio && <Text style={styles.bio} numberOfLines={2}>{p.bio}</Text>}
                        <View style={styles.pillRow}>
                          {p.serviceCategoryIds.slice(0, 3).map((cid) => (
                            <View key={cid} style={styles.pill}>
                              <Text style={styles.pillText}>{catName(cid)}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="briefcase-outline" size={13} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{p.experienceYears}y experience</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={13} color={COLORS.textTertiary} />
                        <Text style={styles.metaText} numberOfLines={1}>{p.serviceAreas.join(', ') || '—'}</Text>
                      </View>
                    </View>
                    <View style={styles.actionRow}>
                      {busyId === p.id ? (
                        <ActivityIndicator color={accent.color} />
                      ) : (
                        <>
                          <TouchableOpacity style={styles.rejectBtn} onPress={() => act(p, 'REJECTED')} activeOpacity={0.7}>
                            <Ionicons name="close" size={16} color={COLORS.error} />
                            <Text style={styles.rejectText}>Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.approveBtn} onPress={() => act(p, 'APPROVED')} activeOpacity={0.7}>
                            <Ionicons name="checkmark" size={16} color={COLORS.textInverse} />
                            <Text style={styles.approveText}>Approve</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle" size={36} color={COLORS.accent} />
                <Text style={styles.emptyTitle}>All caught up</Text>
                <Text style={styles.emptyDesc}>No pending trader approvals</Text>
              </View>
            )
          ) : (
            <View style={styles.list}>
              {approved.map((p) => (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={20} color={COLORS.textTertiary} />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name}>{p.name}</Text>
                        {p.verified && <Ionicons name="checkmark-circle" size={15} color={COLORS.accent} />}
                      </View>
                      <View style={styles.ratingRow}>
                        <RatingStars rating={p.overallRating} size={11} />
                        <Text style={styles.ratingText}>{p.overallRating.toFixed(1)} ({p.totalReviews})</Text>
                      </View>
                      <Badge level={p.badgeLevel} size="sm" />
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="briefcase-outline" size={13} color={COLORS.textTertiary} />
                      <Text style={styles.metaText}>{p.completedJobs} jobs completed</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    {busyId === p.id ? (
                      <ActivityIndicator color={accent.color} />
                    ) : (
                      <TouchableOpacity style={styles.suspendBtn} onPress={() => act(p, 'SUSPENDED')} activeOpacity={0.7}>
                        <Ionicons name="pause-circle-outline" size={16} color={COLORS.warning} />
                        <Text style={styles.suspendText}>Suspend</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              {approved.length === 0 && (
                <View style={styles.emptyCard}>
                  <Ionicons name="briefcase-outline" size={36} color={COLORS.textTertiary} />
                  <Text style={styles.emptyTitle}>No approved traders yet</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.md },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.md },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.pill, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  listContent: { paddingHorizontal: SPACING.lg },
  list: { gap: SPACING.md },
  card: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  cardTop: { flexDirection: 'row', gap: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.glassBorder, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bio: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, backgroundColor: 'rgba(34,229,255,0.10)', borderWidth: 1, borderColor: 'rgba(34,229,255,0.20)' },
  pillText: { fontSize: 10, fontWeight: '700', color: COLORS.cyan },
  metaRow: { flexDirection: 'row', gap: SPACING.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 12, color: COLORS.textTertiary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, minHeight: 40, alignItems: 'center' },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,92,122,0.08)', borderRadius: RADIUS.md, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(255,92,122,0.30)' },
  rejectText: { fontSize: 13, fontWeight: '700', color: COLORS.error },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: 11 },
  approveText: { fontSize: 13, fontWeight: '700', color: COLORS.textInverse },
  suspendBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,184,64,0.08)', borderRadius: RADIUS.md, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(255,184,64,0.30)' },
  suspendText: { fontSize: 13, fontWeight: '700', color: COLORS.warning },
  emptyCard: { alignItems: 'center', paddingTop: SPACING.xxl * 2, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptyDesc: { fontSize: 13, color: COLORS.textTertiary },
});
