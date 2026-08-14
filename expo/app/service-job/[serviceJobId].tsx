import { useLocalSearchParams, router, Link } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
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
import { useCategories, useJob, useProviders } from '@/hooks/use-data';
import { formatNLe } from '@/data/mock';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/Badge';
import { FlashingBookButton } from '@/components/FlashingBookButton';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';

export default function ServiceJobDetailScreen() {
  const { serviceJobId } = useLocalSearchParams<{ serviceJobId: string }>();
  const { data: job, isLoading: jobLoading } = useJob(serviceJobId);
  const { data: categories } = useCategories();
  const { data: allProviders } = useProviders();

  const category = useMemo(
    () => (job ? (categories ?? []).find((c) => c.id === job.categoryId) : undefined),
    [job, categories],
  );
  const providers = useMemo(
    () => (job ? (allProviders ?? []).filter((p) => job.providerIds.includes(p.id)) : []),
    [job, allProviders],
  );

  if (jobLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.navy} />
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundHeader}>
          <BackButton style={styles.backBtn} color={COLORS.white} />
        </View>
        <View style={styles.centerWrap}>
          <Text style={styles.notFoundTitle}>Service not found</Text>
          <Text style={styles.notFoundSubtext}>
            This service may no longer be available. Go back and pick another one.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[job.color, `${job.color}DD`]}
          style={styles.header}
        >
          <View style={styles.headerNav}>
            <BackButton style={styles.backBtn} color={COLORS.white} />
            <LogoutButton color={COLORS.white} />
          </View>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={job.icon as any} size={36} color={COLORS.white} />
            </View>
            <Text style={styles.headerTitle}>{job.name}</Text>
            <Text style={styles.headerCategory}>{category?.name}</Text>
          </View>
        </LinearGradient>

        {/* Description and details */}
        <View style={styles.detailSection}>
          <Text style={styles.detailDesc}>{job.description}</Text>

          <View style={styles.detailGrid}>
            <View style={styles.detailCard}>
              <View style={styles.detailCardIcon}>
                <Ionicons name="cash-outline" size={20} color={COLORS.navy} />
              </View>
              <Text style={styles.detailCardLabel}>Base Price</Text>
              <Text style={styles.detailCardValue}>{formatNLe(job.basePrice)}</Text>
            </View>
            <View style={styles.detailCard}>
              <View style={styles.detailCardIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.navy} />
              </View>
              <Text style={styles.detailCardLabel}>Duration</Text>
              <Text style={styles.detailCardValue}>{job.estimatedDuration}</Text>
            </View>
            <View style={styles.detailCard}>
              <View style={styles.detailCardIcon}>
                <Ionicons name="clipboard-outline" size={20} color={COLORS.navy} />
              </View>
              <Text style={styles.detailCardLabel}>Assessment</Text>
              <Text style={styles.detailCardValue}>{job.assessmentFee > 0 ? formatNLe(job.assessmentFee) : 'Free'}</Text>
            </View>
          </View>
        </View>

        {/* Booking type info */}
        <View style={styles.bookingTypeInfo}>
          <View style={styles.bookingTypeCard}>
            <Ionicons name="flash" size={20} color={COLORS.green} />
            <View style={styles.bookingTypeText}>
              <Text style={styles.bookingTypeTitle}>Instant Booking</Text>
              <Text style={styles.bookingTypeDesc}>Get matched with an available provider immediately</Text>
            </View>
          </View>
          <View style={styles.bookingTypeCard}>
            <Ionicons name="document-text" size={20} color={COLORS.warning} />
            <View style={styles.bookingTypeText}>
              <Text style={styles.bookingTypeTitle}>In-Person Quote</Text>
              <Text style={styles.bookingTypeDesc}>Provider visits to assess and quote the price</Text>
            </View>
          </View>
        </View>

        {/* Providers list */}
        <View style={styles.providersSection}>
          <View style={styles.providersHeader}>
            <Text style={styles.providersTitle}>Available Providers</Text>
            <Text style={styles.providersCount}>{providers.length} found</Text>
          </View>
          <View style={styles.providersList}>
            {providers.length === 0 ? (
              <View style={styles.emptyProviders}>
                <Ionicons name="people-outline" size={28} color={COLORS.textTertiary} />
                <Text style={styles.emptyProvidersTitle}>No providers available yet</Text>
                <Text style={styles.emptyProvidersText}>
                  New traders join every day — check back soon.
                </Text>
              </View>
            ) : (
              providers.map((provider) => (
              <Link key={provider.id} href={`/provider/${provider.id}`} asChild>
                <TouchableOpacity style={styles.providerCard} activeOpacity={0.7}>
                  <View style={styles.providerLeft}>
                    <View style={styles.providerAvatar}>
                      {provider.verified && (
                        <View style={styles.providerVerified}>
                          <Ionicons name="checkmark" size={10} color={COLORS.white} />
                        </View>
                      )}
                    </View>
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <View style={styles.providerMeta}>
                        <RatingStars rating={provider.overallRating} size={12} />
                        <Text style={styles.providerRatingText}>{provider.overallRating} ({provider.totalReviews})</Text>
                      </View>
                      <View style={styles.providerTags}>
                        <Badge level={provider.badgeLevel} size="sm" />
                        <View style={styles.providerExp}>
                          <Ionicons name="briefcase-outline" size={11} color={COLORS.textTertiary} />
                          <Text style={styles.providerExpText}>{provider.experienceYears}y exp</Text>
                        </View>
                      </View>
                      <View style={styles.providerAreas}>
                        <Ionicons name="location-outline" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.providerAreaText}>{provider.serviceAreas.join(', ')}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.providerRight}>
                    <View style={styles.providerResponse}>
                      <Ionicons name="time-outline" size={12} color={COLORS.green} />
                      <Text style={styles.providerResponseText}>{provider.responseTime}</Text>
                    </View>
                    <FlashingBookButton
                      onPress={() => router.push(`/booking/create?jobId=${job.id}&providerId=${provider.id}`)}
                    />
                  </View>
                </TouchableOpacity>
              </Link>
              ))
            )}
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  notFoundHeader: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  notFoundTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  notFoundSubtext: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyProviders: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyProvidersTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  emptyProvidersText: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center' },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  detailSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  detailDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  detailCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  detailCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCardLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  detailCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  bookingTypeInfo: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  bookingTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  bookingTypeText: { flex: 1 },
  bookingTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bookingTypeDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  providersSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  providersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  providersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  providersCount: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  providersList: {
    gap: SPACING.md,
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  providerLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.md,
  },
  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.divider,
  },
  providerVerified: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  providerInfo: { flex: 1, gap: 4 },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerRatingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  providerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  providerExp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  providerExpText: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  providerAreas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerAreaText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  providerRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  providerResponse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  providerResponseText: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: '600',
  },
});
