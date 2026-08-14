import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/Badge';
import {
  useReviewsForProvider,
  useProviderForUser,
  useReplyToReview,
  useAppealReview,
} from '@/hooks/use-data';
import type { Review } from '@/types';

export default function ProviderReviewsScreen() {
  const { user } = useAuth();
  const accent = ROLE_ACCENT.PROVIDER;
  const { data: provider } = useProviderForUser(user?.id);
  const { data: reviews = [], refetch, isLoading } = useReviewsForProvider(provider?.id);
  const replyMutation = useReplyToReview();
  const appealMutation = useAppealReview();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [appealingTo, setAppealingTo] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState('');

  const dims = useMemo(() => {
    if (reviews.length === 0) return { timeliness: 0, professionalism: 0, quality: 0, communication: 0 };
    const sum = reviews.reduce(
      (acc, r) => ({
        timeliness: acc.timeliness + r.timeliness,
        professionalism: acc.professionalism + r.professionalism,
        quality: acc.quality + r.quality,
        communication: acc.communication + r.communication,
      }),
      { timeliness: 0, professionalism: 0, quality: 0, communication: 0 },
    );
    return {
      timeliness: sum.timeliness / reviews.length,
      professionalism: sum.professionalism / reviews.length,
      quality: sum.quality / reviews.length,
      communication: sum.communication / reviews.length,
    };
  }, [reviews]);

  const sendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { reviewId, reply: replyText.trim() },
      {
        onSuccess: () => {
          setReplyingTo(null);
          setReplyText('');
          Alert.alert('Reply posted');
        },
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  };

  const sendAppeal = (reviewId: string) => {
    if (!appealReason.trim()) {
      Alert.alert('Reason required', 'Please explain why this review is unfair.');
      return;
    }
    appealMutation.mutate(
      { reviewId, reason: appealReason.trim() },
      {
        onSuccess: () => {
          setAppealingTo(null);
          setAppealReason('');
          Alert.alert('Appeal submitted', 'An admin will review your appeal.');
        },
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  };

  return (
    <ScreenBackground variant="provider">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reviews & Profile</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={accent.color} />}
            keyboardShouldPersistTaps="handled"
          >
            {/* Rating summary */}
            {provider && (
              <View style={styles.summaryCard}>
                <View style={[styles.summaryGlow, { backgroundColor: accent.glow }]} />
                <View style={styles.summaryContent}>
                  <View style={styles.summaryTop}>
                    <Text style={styles.summaryRating}>{provider.overallRating.toFixed(1)}</Text>
                    <View style={{ flex: 1, gap: 4 }}>
                      <RatingStars rating={provider.overallRating} size={15} color={accent.color} />
                      <Text style={styles.summaryCount}>{provider.totalReviews} reviews · {provider.completedJobs} jobs completed</Text>
                      <Badge level={provider.badgeLevel} size="sm" />
                    </View>
                  </View>

                  {/* Dimension breakdown */}
                  <View style={styles.dimsRow}>
                    <DimBar label="Punctuality" value={dims.timeliness} accent={accent.color} />
                    <DimBar label="Quality" value={dims.quality} accent={accent.color} />
                    <DimBar label="Communication" value={dims.communication} accent={accent.color} />
                    <DimBar label="Professionalism" value={dims.professionalism} accent={accent.color} />
                  </View>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: accent.color }]}>{provider.responseRate ?? 92}%</Text>
                      <Text style={styles.statLabel}>Response Rate</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: accent.color }]}>{provider.onTimeRate ?? 88}%</Text>
                      <Text style={styles.statLabel}>On-Time</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: accent.color }]}>{provider.responseTime || '8 mins'}</Text>
                      <Text style={styles.statLabel}>Avg Response</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Edit profile link */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.editCard, { borderColor: `${accent.color}40` }]}
                activeOpacity={0.7}
                onPress={() => router.push('/provider/onboarding')}
              >
                <Ionicons name="create-outline" size={20} color={accent.color} />
                <Text style={[styles.editText, { color: accent.color }]}>Edit Provider Profile</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Reviews list */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <View style={styles.reviewsList}>
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      accent={accent.color}
                      replyingTo={replyingTo}
                      replyText={replyText}
                      onReplyStart={() => { setReplyingTo(r.id); setReplyText(''); }}
                      onReplyCancel={() => { setReplyingTo(null); setReplyText(''); }}
                      onReplyChange={setReplyText}
                      onReplySend={() => sendReply(r.id)}
                      appealingTo={appealingTo}
                      appealReason={appealReason}
                      onAppealStart={() => { setAppealingTo(r.id); setAppealReason(''); }}
                      onAppealCancel={() => { setAppealingTo(null); setAppealReason(''); }}
                      onAppealChange={setAppealReason}
                      onAppealSend={() => sendAppeal(r.id)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <Ionicons name="star-outline" size={32} color={COLORS.textTertiary} />
                    <Text style={styles.emptyTitle}>No reviews yet</Text>
                    <Text style={styles.emptyDesc}>Reviews from clients will appear here</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ height: SPACING.xxl + 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function DimBar({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={styles.dimRow}>
      <Text style={styles.dimLabel}>{label}</Text>
      <View style={styles.dimBarBg}>
        <View style={[styles.dimBarFill, { width: `${(value / 5) * 100}%`, backgroundColor: accent }]} />
      </View>
      <Text style={styles.dimValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

function ReviewCard({
  review,
  accent,
  replyingTo,
  replyText,
  onReplyStart,
  onReplyCancel,
  onReplyChange,
  onReplySend,
  appealingTo,
  appealReason,
  onAppealStart,
  onAppealCancel,
  onAppealChange,
  onAppealSend,
}: {
  review: Review;
  accent: string;
  replyingTo: string | null;
  replyText: string;
  onReplyStart: () => void;
  onReplyCancel: () => void;
  onReplyChange: (t: string) => void;
  onReplySend: () => void;
  appealingTo: string | null;
  appealReason: string;
  onAppealStart: () => void;
  onAppealCancel: () => void;
  onAppealChange: (t: string) => void;
  onAppealSend: () => void;
}) {
  const isReplying = replyingTo === review.id;
  const isAppealing = appealingTo === review.id;
  const canAppeal = !review.appealStatus && review.status !== 'HIDDEN';
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewAvatar}>
          <Ionicons name="person" size={18} color={COLORS.textTertiary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewCustomer}>{review.customerName}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <Text style={[styles.reviewOverall, { color: accent }]}>{review.overall.toFixed(1)}</Text>
      </View>
      <RatingStars rating={review.overall} size={12} color={COLORS.amber} />
      <Text style={styles.reviewComment}>{review.comment}</Text>
      {review.providerReply && (
        <View style={styles.replyBlock}>
          <Text style={styles.replyLabel}>Your reply</Text>
          <Text style={styles.replyText}>{review.providerReply}</Text>
        </View>
      )}
      {isReplying ? (
        <View style={styles.replyForm}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor={COLORS.textTertiary}
            value={replyText}
            onChangeText={onReplyChange}
            multiline
            autoFocus
          />
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.replyCancelBtn} onPress={onReplyCancel}>
              <Text style={styles.replyCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.replySendBtn, { backgroundColor: accent }]} onPress={onReplySend}>
              <Text style={styles.replySendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        !review.providerReply && (
          <TouchableOpacity style={styles.replyBtn} onPress={onReplyStart} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={13} color={accent} />
            <Text style={[styles.replyBtnText, { color: accent }]}>Reply</Text>
          </TouchableOpacity>
        )
      )}
      {review.appealStatus ? (
        <View style={styles.appealStatusRow}>
          <Ionicons
            name={review.appealStatus === 'PENDING' ? 'time-outline' : review.appealStatus === 'UPHELD' ? 'shield-checkmark-outline' : 'checkmark-circle-outline'}
            size={12}
            color={review.appealStatus === 'PENDING' ? COLORS.amber : COLORS.accent}
          />
          <Text style={styles.appealStatusText}>
            {review.appealStatus === 'PENDING'
              ? 'Appeal pending admin review'
              : review.appealStatus === 'UPHELD'
                ? 'Appeal reviewed — review kept'
                : 'Appeal accepted — review hidden'}
          </Text>
        </View>
      ) : isAppealing ? (
        <View style={styles.replyForm}>
          <TextInput
            style={styles.replyInput}
            placeholder="Explain why this review is unfair..."
            placeholderTextColor={COLORS.textTertiary}
            value={appealReason}
            onChangeText={onAppealChange}
            multiline
            autoFocus
          />
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.replyCancelBtn} onPress={onAppealCancel}>
              <Text style={styles.replyCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.replySendBtn, { backgroundColor: COLORS.amber }]} onPress={onAppealSend}>
              <Text style={styles.replySendText}>Submit Appeal</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        canAppeal && (
          <TouchableOpacity style={styles.appealBtn} onPress={onAppealStart} activeOpacity={0.7}>
            <Ionicons name="flag-outline" size={13} color={COLORS.amber} />
            <Text style={styles.appealBtnText}>Appeal</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  summaryCard: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg },
  summaryGlow: { ...StyleSheet.absoluteFillObject },
  summaryContent: { padding: SPACING.lg, gap: SPACING.md, position: 'relative', zIndex: 1 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  summaryRating: { fontSize: 48, fontWeight: '800', color: COLORS.textPrimary },
  summaryCount: { fontSize: 12, color: COLORS.textSecondary },
  dimsRow: { gap: SPACING.sm },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dimLabel: { fontSize: 12, color: COLORS.textSecondary, width: 100 },
  dimBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  dimBarFill: { height: '100%', borderRadius: 3 },
  dimValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, width: 32, textAlign: 'right' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.divider },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  editCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1 },
  editText: { flex: 1, fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  reviewsList: { gap: SPACING.sm },
  reviewCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.glassBorder, justifyContent: 'center', alignItems: 'center' },
  reviewCustomer: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  reviewDate: { fontSize: 11, color: COLORS.textTertiary, marginTop: 1 },
  reviewOverall: { fontSize: 16, fontWeight: '800' },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  replyBlock: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder },
  replyLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  replyText: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
  replyForm: { gap: SPACING.sm },
  replyInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: 13, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.glassBorder, minHeight: 60 },
  replyActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm },
  replyCancelBtn: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.pill },
  replyCancelText: { fontSize: 13, color: COLORS.textTertiary, fontWeight: '600' },
  replySendBtn: { paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: RADIUS.pill },
  replySendText: { fontSize: 13, fontWeight: '700', color: COLORS.textInverse },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, backgroundColor: 'rgba(34,229,255,0.08)' },
  replyBtnText: { fontSize: 12, fontWeight: '600' },
  appealBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, backgroundColor: 'rgba(255,184,64,0.08)', marginTop: 4 },
  appealBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.amber },
  appealStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  appealStatusText: { fontSize: 11, color: COLORS.textTertiary, fontStyle: 'italic' },
  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.xs },
  emptyDesc: { fontSize: 12, color: COLORS.textTertiary },
});
