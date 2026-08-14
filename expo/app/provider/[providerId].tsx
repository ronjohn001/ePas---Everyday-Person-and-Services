import { useLocalSearchParams, router, Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { formatNLe } from '@/data/mock';
import { useProvider, useReviewsForProvider, useAllJobs, useCategories } from '@/hooks/use-data';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/Badge';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';
import { FlashingBookButton } from '@/components/FlashingBookButton';
import { ScreenBackground } from '@/components/ScreenBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'about' | 'services' | 'reviews';

export default function ProviderProfileScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const { data: provider } = useProvider(providerId);
  const { data: reviews = [] } = useReviewsForProvider(providerId);
  const { data: allJobs = [] } = useAllJobs();
  const { data: categories = [] } = useCategories();
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const providerJobs = useMemo(() => {
    if (!provider) return [];
    return allJobs.filter(j =>
      provider.serviceCategoryIds.includes(j.categoryId) &&
      j.providerIds.includes(provider.id)
    );
  }, [provider, allJobs]);

  if (!provider) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Text style={{ color: COLORS.textPrimary, padding: SPACING.lg }}>Loading provider…</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.floor(r.overall) === stars).length;
    return { stars, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.navyDark, COLORS.navy]}
          style={styles.header}
        >
          <View style={styles.headerNav}>
            <BackButton style={styles.backBtn} color={COLORS.white} />
            <View style={styles.headerNavRight}>
              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <LogoutButton color={COLORS.white} />
            </View>
          </View>
          <View style={styles.profileSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar} />
              {provider.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{provider.name}</Text>
            <View style={styles.profileRating}>
              <RatingStars rating={provider.overallRating} size={16} />
              <Text style={styles.profileRatingText}>
                {provider.overallRating} ({provider.totalReviews} reviews)
              </Text>
            </View>
            <Badge level={provider.badgeLevel} size="md" />
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.navy} />
            <Text style={styles.statValue}>{provider.completedJobs}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color={COLORS.navy} />
            <Text style={styles.statValue}>{provider.responseTime}</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={20} color={COLORS.navy} />
            <Text style={styles.statValue}>{provider.experienceYears}y</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {(['about', 'services', 'reviews'] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <Text style={styles.aboutLabel}>About</Text>
            <Text style={styles.aboutText}>{provider.bio}</Text>

            <Text style={styles.aboutLabel}>Service Areas</Text>
            <View style={styles.areasRow}>
              {provider.serviceAreas.map(area => (
                <View key={area} style={styles.areaPill}>
                  <Ionicons name="location-outline" size={12} color={COLORS.navy} />
                  <Text style={styles.areaText}>{area}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.aboutLabel}>Categories</Text>
            <View style={styles.areasRow}>
              {provider.serviceCategoryIds.map(catId => {
                const cat = categories.find(c => c.id === catId);
                if (!cat) return null;
                return (
                  <View key={catId} style={[styles.areaPill, { backgroundColor: `${cat.color}15` }]}>
                    <Ionicons name={cat.icon as any} size={12} color={cat.color} />
                    <Text style={[styles.areaText, { color: cat.color }]}>{cat.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.tabContent}>
            <Text style={styles.aboutLabel}>Services Offered ({providerJobs.length})</Text>
            <View style={styles.servicesList}>
              {providerJobs.map(job => {
                const cat = categories.find(c => c.id === job.categoryId);
                return (
                  <View key={job.id} style={styles.serviceItem}>
                    <View style={[styles.serviceIcon, { backgroundColor: `${job.color}15` }]}>
                      <Ionicons name={job.icon as any} size={22} color={job.color} />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{job.name}</Text>
                      <Text style={styles.serviceCat}>{cat?.name} · {job.estimatedDuration}</Text>
                    </View>
                    <View style={styles.servicePrice}>
                      <Text style={styles.servicePriceText}>{formatNLe(job.basePrice)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            {/* Rating breakdown */}
            <View style={styles.ratingBreakdown}>
              <View style={styles.ratingOverall}>
                <Text style={styles.ratingOverallNum}>{provider.overallRating}</Text>
                <RatingStars rating={provider.overallRating} size={14} />
                <Text style={styles.ratingOverallCount}>{provider.totalReviews} reviews</Text>
              </View>
              <View style={styles.ratingBars}>
                {ratingBreakdown.map(({ stars, count, percentage }) => (
                  <View key={stars} style={styles.ratingBarRow}>
                    <Text style={styles.ratingBarStar}>{stars}</Text>
                    <Ionicons name="star" size={12} color="#F39C12" />
                    <View style={styles.ratingBarBg}>
                      <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.ratingBarCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Individual reviews */}
            <View style={styles.reviewsList}>
              {reviews.length > 0 ? reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar} />
                    <View>
                      <Text style={styles.reviewName}>{review.customerName}</Text>
                      <RatingStars rating={review.overall} size={11} />
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <View style={styles.reviewMetrics}>
                    <View style={styles.reviewMetric}>
                      <Text style={styles.reviewMetricLabel}>Timeliness</Text>
                      <Text style={styles.reviewMetricValue}>{review.timeliness}/5</Text>
                    </View>
                    <View style={styles.reviewMetric}>
                      <Text style={styles.reviewMetricLabel}>Quality</Text>
                      <Text style={styles.reviewMetricValue}>{review.quality}/5</Text>
                    </View>
                    <View style={styles.reviewMetric}>
                      <Text style={styles.reviewMetricLabel}>Comm.</Text>
                      <Text style={styles.reviewMetricValue}>{review.communication}/5</Text>
                    </View>
                  </View>
                </View>
              )) : (
                <View style={styles.noReviews}>
                  <Ionicons name="star-outline" size={40} color={COLORS.textTertiary} />
                  <Text style={styles.noReviewsText}>No reviews yet</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.messageBtn} onPress={() => router.push('/(tabs)/messages')}>
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.navy} />
        </TouchableOpacity>
        <FlashingBookButton
          label="Book Now"
          fill
          onPress={() => providerJobs[0] && router.push(`/booking/create?jobId=${providerJobs[0].id}&providerId=${provider.id}`)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.navy,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileRatingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.navy,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  tabTextActive: {
    color: COLORS.navy,
  },
  tabContent: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  aboutLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  areasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  areaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.navy}10`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  areaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  servicesList: {
    gap: SPACING.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  serviceCat: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  servicePrice: {},
  servicePriceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
  },
  ratingBreakdown: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  ratingOverall: {
    alignItems: 'center',
    gap: 4,
  },
  ratingOverallNum: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ratingOverallCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  ratingBars: { flex: 1, gap: 4, justifyContent: 'center' },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingBarStar: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 12,
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#F39C12',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 11,
    color: COLORS.textTertiary,
    width: 20,
    textAlign: 'right',
  },
  reviewsList: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.divider,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 'auto',
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  reviewMetrics: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  reviewMetric: {
    flex: 1,
  },
  reviewMetricLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  reviewMetricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  noReviewsText: {
    fontSize: 15,
    color: COLORS.textTertiary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  messageBtn: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
