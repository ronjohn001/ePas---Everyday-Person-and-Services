import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { RatingStars } from '@/components/RatingStars';
import { useAuth } from '@/hooks/auth-store';
import { useCustomerBookings, useReviewsByCustomer } from '@/hooks/use-data';
import { BackButton } from '@/components/BackButton';

/** Every review the signed-in customer has given, plus prompts for completed jobs still awaiting one. */
export default function MyReviewsScreen() {
  const { user } = useAuth();
  const { data: myBookings = [], refetch: refetchBookings } = useCustomerBookings(user?.id);
  const { data: myReviews = [], refetch: refetchReviews } = useReviewsByCustomer(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const bookingById = useMemo(() => new Map(myBookings.map((b) => [b.id, b])), [myBookings]);
  const pendingReviews = useMemo(
    () => myBookings.filter((b) => b.status === 'COMPLETED' && !b.hasReview),
    [myBookings],
  );

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([refetchBookings(), refetchReviews()]).finally(() => setRefreshing(false));
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <BackButton style={styles.iconBtn} size={20} />
          <Text style={styles.headerTitle}>My Reviews</Text>
          <View style={styles.countChip}>
            <Text style={styles.countText}>{myReviews.length} given</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {/* Completed jobs still waiting for a review */}
          {pendingReviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Awaiting your review</Text>
              {pendingReviews.map((b) => (
                <TouchableOpacity
                  key={`pending-${b.id}`}
                  style={styles.ratePrompt}
                  onPress={() => router.push(`/booking/${b.id}/review`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.ratePromptIcon}>
                    <Ionicons name="star-outline" size={18} color={COLORS.amber} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ratePromptTitle}>Rate {b.providerName}</Text>
                    <Text style={styles.ratePromptSub}>
                      {b.serviceJobName} · completed {b.completedAt ? new Date(b.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'recently'}
                    </Text>
                  </View>
                  <Text style={styles.ratePromptCta}>Rate now</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Reviews given */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews you've given</Text>
            {myReviews.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="chatbubble-ellipses-outline" size={30} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>No reviews yet</Text>
                <Text style={styles.emptyDesc}>Reviews you leave for traders will appear here</Text>
              </View>
            ) : (
              myReviews.map((r) => {
                const booking = bookingById.get(r.bookingId);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.reviewCard}
                    onPress={() => router.push(`/booking/${r.bookingId}`)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.reviewHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewTrader} numberOfLines={1}>{booking?.providerName ?? 'Trader'}</Text>
                        <Text style={styles.reviewService} numberOfLines={1}>{booking?.serviceJobName ?? 'Service'}</Text>
                      </View>
                      <RatingStars rating={r.overall} size={13} />
                    </View>
                    {!!r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                    {!!r.providerReply && (
                      <View style={styles.replyBlock}>
                        <View style={styles.replyHead}>
                          <Ionicons name="return-down-forward" size={12} color={COLORS.cyan} />
                          <Text style={styles.replyLabel}>Trader replied</Text>
                        </View>
                        <Text style={styles.replyText} numberOfLines={2}>{r.providerReply}</Text>
                      </View>
                    )}
                    <Text style={styles.reviewMeta}>
                      {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: SPACING.xxl }} />
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
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
    backgroundColor: 'rgba(255,190,70,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,190,70,0.25)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: { fontSize: 11.5, fontWeight: '700', color: COLORS.amber },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  section: { marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  ratePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,190,70,0.08)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,190,70,0.22)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  ratePromptIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,190,70,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratePromptTitle: { fontSize: 13.5, fontWeight: '600', color: COLORS.textPrimary },
  ratePromptSub: { fontSize: 11.5, color: COLORS.textTertiary, marginTop: 1 },
  ratePromptCta: { fontSize: 12.5, fontWeight: '700', color: COLORS.amber },
  reviewCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 6,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewTrader: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  reviewService: { fontSize: 11.5, color: COLORS.textTertiary, marginTop: 1 },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  replyBlock: {
    backgroundColor: 'rgba(34,229,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(34,229,255,0.16)',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: 3,
  },
  replyHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyLabel: { fontSize: 10.5, fontWeight: '700', color: COLORS.cyan, textTransform: 'uppercase', letterSpacing: 0.4 },
  replyText: { fontSize: 12.5, color: COLORS.textSecondary, lineHeight: 17 },
  reviewMeta: { fontSize: 11, color: COLORS.textTertiary },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.xs },
  emptyDesc: { fontSize: 12, color: COLORS.textTertiary },
});
