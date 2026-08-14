import { useAuth } from '@/hooks/auth-store';
import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';
import { RatingStars } from '@/components/RatingStars';
import {
  useAllReviews,
  useAppealedReviews,
  useSetReviewStatus,
  useResolveAppeal,
  useDisputes,
  useAllBookings,
  useResolveDispute,
  formatNLe,
} from '@/hooks/use-data';
import type { Dispute, Review } from '@/types';

type Section = 'REVIEWS' | 'APPEALS' | 'DISPUTES';

/** Admin Reviews hub — user review moderation, trader appeals, and disputes in one screen. */
export default function AdminReviewsScreen() {
  const { user } = useAuth();
  const accent = ROLE_ACCENT.ADMIN;
  const [section, setSection] = useState<Section>('REVIEWS');

  const { data: reviews = [], refetch: refetchReviews, isLoading } = useAllReviews();
  const { data: appeals = [] } = useAppealedReviews();
  const { data: disputes = [] } = useDisputes();
  const { data: bookings = [] } = useAllBookings();

  const setReviewStatus = useSetReviewStatus();
  const resolveAppeal = useResolveAppeal();
  const resolveDispute = useResolveDispute();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const flagged = useMemo(
    () => reviews.filter((r) => r.status === 'REPORTED' || r.overall < 3),
    [reviews],
  );
  const openDisputes = useMemo(
    () => disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW'),
    [disputes],
  );

  const sections: { key: Section; label: string; count: number }[] = [
    { key: 'REVIEWS', label: 'User Reviews', count: flagged.length },
    { key: 'APPEALS', label: 'Trader Appeals', count: appeals.length },
    { key: 'DISPUTES', label: 'Disputes', count: openDisputes.length },
  ];

  const moderateReview = (r: Review, action: 'keep' | 'hide') => {
    const status = action === 'keep' ? 'VISIBLE' : 'HIDDEN';
    Alert.alert(
      action === 'keep' ? 'Keep review' : 'Hide review',
      action === 'keep' ? 'This review will stay visible to customers.' : 'This review will be hidden from the platform.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'keep' ? 'Keep' : 'Hide',
          style: action === 'keep' ? 'default' : 'destructive',
          onPress: () => {
            setBusyId(r.id);
            setReviewStatus.mutate(
              { reviewId: r.id, status },
              {
                onSettled: () => setBusyId(null),
                onError: (e) => Alert.alert('Error', (e as Error).message),
              },
            );
          },
        },
      ],
    );
  };

  const decideAppeal = (r: Review, outcome: 'UPHELD' | 'OVERTURNED') => {
    Alert.alert(
      outcome === 'UPHELD' ? 'Uphold review' : 'Overturn review',
      outcome === 'UPHELD'
        ? 'The review stays visible and the appeal is closed.'
        : 'The review will be hidden and the trader’s appeal is accepted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: outcome === 'UPHELD' ? 'Uphold' : 'Overturn',
          style: outcome === 'UPHELD' ? 'default' : 'destructive',
          onPress: () => {
            setBusyId(r.id);
            resolveAppeal.mutate(
              { reviewId: r.id, outcome },
              {
                onSettled: () => setBusyId(null),
                onError: (e) => Alert.alert('Error', (e as Error).message),
              },
            );
          },
        },
      ],
    );
  };

  const settleDispute = (d: Dispute, action: 'refund' | 'release') => {
    const booking = bookings.find((b) => b.id === d.bookingId);
    const label = action === 'refund' ? 'Issue Refund' : 'Release Escrow';
    Alert.alert(
      label,
      action === 'refund'
        ? `Refund ${booking ? formatNLe(booking.finalPrice) : 'the payment'} to the customer?`
        : 'Release the escrowed payment to the trader?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: label,
          style: action === 'refund' ? 'destructive' : 'default',
          onPress: () => {
            setBusyId(d.id);
            resolveDispute.mutate(
              {
                disputeId: d.id,
                bookingId: d.bookingId,
                action,
                resolution: action === 'refund' ? 'Admin issued a full refund to the customer.' : 'Admin released escrow payment to the trader.',
                resolvedBy: user?.id ?? 'admin',
                refundAmount: action === 'refund' ? booking?.finalPrice : undefined,
              },
              {
                onSettled: () => setBusyId(null),
                onSuccess: () => setSelectedDispute(null),
                onError: (e) => Alert.alert('Error', (e as Error).message),
              },
            );
          },
        },
      ],
    );
  };

  return (
    <ScreenBackground variant="admin">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <BackButton size={24} />
          <Text style={styles.headerTitle}>Reviews</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        {/* Section switcher */}
        <View style={styles.tabsRow}>
          {sections.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.tab, section === s.key && { backgroundColor: accent.color, borderColor: accent.color }]}
              onPress={() => setSection(s.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, section === s.key && { color: COLORS.textInverse }]}>
                {s.label}{s.count > 0 ? ` (${s.count})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchReviews} tintColor={accent.color} />}
        >
          {/* User review moderation */}
          {section === 'REVIEWS' && (
            <View style={styles.list}>
              {flagged.length > 0 ? (
                flagged.map((r) => (
                  <View key={r.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={16} color={COLORS.textTertiary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardName}>{r.customerName}</Text>
                        <Text style={styles.cardDate}>
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={[styles.score, { color: r.overall < 3 ? COLORS.error : COLORS.amber }]}>{r.overall.toFixed(1)}</Text>
                    </View>
                    <RatingStars rating={r.overall} size={12} color={COLORS.amber} />
                    <Text style={styles.comment}>{r.comment}</Text>
                    <View style={styles.flagRow}>
                      <View style={styles.flagPill}>
                        <Ionicons name="flag" size={10} color={COLORS.error} />
                        <Text style={styles.flagText}>{r.status === 'REPORTED' ? 'Reported' : 'Low rating'}</Text>
                      </View>
                    </View>
                    <View style={styles.actionRow}>
                      {busyId === r.id ? (
                        <ActivityIndicator color={accent.color} />
                      ) : (
                        <>
                          <TouchableOpacity style={styles.keepBtn} onPress={() => moderateReview(r, 'keep')} activeOpacity={0.7}>
                            <Ionicons name="checkmark" size={14} color={COLORS.accent} />
                            <Text style={styles.keepText}>Keep</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.hideBtn} onPress={() => moderateReview(r, 'hide')} activeOpacity={0.7}>
                            <Ionicons name="eye-off-outline" size={14} color={COLORS.error} />
                            <Text style={styles.hideText}>Hide</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="shield-checkmark" size={28} color={COLORS.accent} />
                  <Text style={styles.emptyTitle}>No flagged reviews</Text>
                  <Text style={styles.emptyDesc}>Reported or low-rated reviews will appear here</Text>
                </View>
              )}
            </View>
          )}

          {/* Trader appeals */}
          {section === 'APPEALS' && (
            <View style={styles.list}>
              {appeals.length > 0 ? (
                appeals.map((r) => (
                  <View key={r.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={16} color={COLORS.textTertiary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardName}>{r.customerName}</Text>
                        <Text style={styles.cardDate}>
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={[styles.score, { color: COLORS.amber }]}>{r.overall.toFixed(1)}</Text>
                    </View>
                    <RatingStars rating={r.overall} size={12} color={COLORS.amber} />
                    <Text style={styles.comment}>{r.comment}</Text>
                    <View style={styles.appealBlock}>
                      <Text style={styles.appealLabel}>Trader's appeal</Text>
                      <Text style={styles.appealText}>{r.appealReason || 'No reason provided'}</Text>
                    </View>
                    <View style={styles.actionRow}>
                      {busyId === r.id ? (
                        <ActivityIndicator color={accent.color} />
                      ) : (
                        <>
                          <TouchableOpacity style={styles.keepBtn} onPress={() => decideAppeal(r, 'UPHELD')} activeOpacity={0.7}>
                            <Ionicons name="checkmark" size={14} color={COLORS.accent} />
                            <Text style={styles.keepText}>Uphold Review</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.hideBtn} onPress={() => decideAppeal(r, 'OVERTURNED')} activeOpacity={0.7}>
                            <Ionicons name="eye-off-outline" size={14} color={COLORS.error} />
                            <Text style={styles.hideText}>Overturn & Hide</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="checkmark-circle-outline" size={28} color={COLORS.accent} />
                  <Text style={styles.emptyTitle}>No pending appeals</Text>
                  <Text style={styles.emptyDesc}>When a trader appeals a review it will appear here</Text>
                </View>
              )}
            </View>
          )}

          {/* Disputes */}
          {section === 'DISPUTES' && (
            <View style={styles.list}>
              {openDisputes.length > 0 ? (
                openDisputes.map((d) => {
                  const booking = bookings.find((b) => b.id === d.bookingId);
                  return (
                    <TouchableOpacity key={d.id} style={styles.card} onPress={() => setSelectedDispute(d)} activeOpacity={0.7}>
                      <View style={styles.cardTop}>
                        <View style={styles.statusPill}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>{d.status.replace('_', ' ')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                      </View>
                      <Text style={styles.disputeReason}>{d.reason || 'No reason provided'}</Text>
                      <Text style={styles.comment} numberOfLines={2}>{d.description}</Text>
                      {booking && (
                        <View style={styles.bookingChip}>
                          <Ionicons name={booking.serviceJobIcon as any} size={12} color={booking.serviceJobColor} />
                          <Text style={styles.bookingChipText}>{booking.serviceJobName} · {formatNLe(booking.finalPrice)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="scale-outline" size={28} color={COLORS.textTertiary} />
                  <Text style={styles.emptyTitle}>No open disputes</Text>
                  <Text style={styles.emptyDesc}>Customer disputes will appear here</Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>

        {/* Dispute detail modal */}
        <Modal visible={!!selectedDispute} transparent animationType="slide" onRequestClose={() => setSelectedDispute(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedDispute && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Dispute Details</Text>
                    <TouchableOpacity onPress={() => setSelectedDispute(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Reason</Text>
                      <Text style={styles.modalValue}>{selectedDispute.reason || '—'}</Text>
                    </View>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Description</Text>
                      <Text style={styles.modalValue}>{selectedDispute.description || '—'}</Text>
                    </View>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Raised By</Text>
                      <Text style={styles.modalValue}>{selectedDispute.raisedBy}</Text>
                    </View>
                  </ScrollView>
                  <View style={styles.modalActions}>
                    {busyId === selectedDispute.id ? (
                      <ActivityIndicator color={accent.color} />
                    ) : (
                      <>
                        <TouchableOpacity style={styles.refundBtn} onPress={() => settleDispute(selectedDispute, 'refund')} activeOpacity={0.7}>
                          <Ionicons name="cash-outline" size={15} color={COLORS.error} />
                          <Text style={styles.refundText}>Issue Refund</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.releaseBtn, { backgroundColor: accent.color, borderColor: accent.color }]} onPress={() => settleDispute(selectedDispute, 'release')} activeOpacity={0.7}>
                          <Ionicons name="checkmark-done" size={15} color={COLORS.textInverse} />
                          <Text style={styles.releaseText}>Release Escrow</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  listContent: { paddingHorizontal: SPACING.lg },
  list: { gap: SPACING.md },
  card: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.glassBorder, justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  cardDate: { fontSize: 11, color: COLORS.textTertiary, marginTop: 1 },
  score: { fontSize: 16, fontWeight: '800' },
  comment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  flagRow: { flexDirection: 'row' },
  flagPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, backgroundColor: 'rgba(255,92,122,0.10)', borderWidth: 1, borderColor: 'rgba(255,92,122,0.25)' },
  flagText: { fontSize: 10, fontWeight: '700', color: COLORS.error },
  appealBlock: { backgroundColor: 'rgba(34,229,255,0.06)', borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: 'rgba(34,229,255,0.20)', gap: 3 },
  appealLabel: { fontSize: 10, fontWeight: '700', color: COLORS.cyan, textTransform: 'uppercase', letterSpacing: 0.5 },
  appealText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, minHeight: 38, alignItems: 'center' },
  keepBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md, gap: 5, borderWidth: 1, borderColor: 'rgba(0,255,163,0.30)', backgroundColor: 'rgba(0,255,163,0.08)' },
  keepText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },
  hideBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md, gap: 5, borderWidth: 1, borderColor: 'rgba(255,92,122,0.30)', backgroundColor: 'rgba(255,92,122,0.08)' },
  hideText: { fontSize: 12, fontWeight: '700', color: COLORS.error },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: RADIUS.pill, borderWidth: 1, backgroundColor: 'rgba(255,92,122,0.12)', borderColor: 'rgba(255,92,122,0.30)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.error },
  statusText: { fontSize: 11, fontWeight: '700', color: COLORS.error },
  disputeReason: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  bookingChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.pill, backgroundColor: COLORS.glassBgLight, borderWidth: 1, borderColor: COLORS.glassBorder },
  bookingChipText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.xs },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.xs },
  emptyDesc: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '85%', borderWidth: 1, borderColor: COLORS.glassBorder },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  modalSection: { marginBottom: SPACING.md, gap: 4 },
  modalLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalValue: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, minHeight: 44, alignItems: 'center' },
  refundBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md, gap: 6, borderWidth: 1, backgroundColor: 'rgba(255,92,122,0.08)', borderColor: 'rgba(255,92,122,0.30)' },
  refundText: { fontSize: 13, fontWeight: '700', color: COLORS.error },
  releaseBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md, gap: 6, borderWidth: 1 },
  releaseText: { fontSize: 13, fontWeight: '700', color: COLORS.textInverse },
});
