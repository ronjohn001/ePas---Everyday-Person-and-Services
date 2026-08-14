import { useLocalSearchParams, Link } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { useCategories, useJobsByCategory, useProviders } from '@/hooks/use-data';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/Badge';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { data: categories = [] } = useCategories();
  const { data: jobs = [] } = useJobsByCategory(categoryId);
  const { data: providers = [] } = useProviders();
  const category = categories.find(c => c.id === categoryId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter(j => j.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [jobs, searchQuery]);

  const categoryProviders = useMemo(() => {
    return providers.filter(p => p.serviceCategoryIds.includes(categoryId)).slice(0, 4);
  }, [providers, categoryId]);

  if (!category) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Text style={{ color: COLORS.textPrimary, padding: SPACING.lg }}>Loading category…</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[category.color, `${category.color}DD`]}
          style={styles.header}
        >
          <View style={styles.headerNav}>
            <BackButton style={styles.backBtn} color={COLORS.white} />
            <LogoutButton color={COLORS.white} />
          </View>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={category.icon as any} size={40} color={COLORS.white} />
            </View>
            <Text style={styles.headerTitle}>{category.name}</Text>
            <Text style={styles.headerDesc}>{category.description}</Text>
            <View style={styles.headerStats}>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatNum}>{jobs.length}</Text>
                <Text style={styles.headerStatLabel}>Services</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStat}>
                <Text style={styles.headerStatNum}>{categoryProviders.length}+</Text>
                <Text style={styles.headerStatLabel}>Providers</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services in this category..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Services list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.jobsList}>
            {filteredJobs.map((job) => {
              const jobProviders = providers.filter(p => p.serviceCategoryIds.includes(job.categoryId) || job.providerIds.includes(p.id));
              return (
                <Link key={job.id} href={`/service-job/${job.id}`} asChild>
                  <TouchableOpacity style={styles.jobCard} activeOpacity={0.7}>
                    <View style={[styles.jobIcon, { backgroundColor: `${job.color}15` }]}>
                      <Ionicons name={job.icon as any} size={24} color={job.color} />
                    </View>
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobName}>{job.name}</Text>
                      <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
                      <View style={styles.jobMeta}>
                        <View style={styles.jobMetaItem}>
                          <Ionicons name="people" size={13} color={COLORS.textTertiary} />
                          <Text style={styles.jobMetaText}>{jobProviders.length} providers</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </View>

        {/* Providers in this category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Providers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: SPACING.lg }}>
            {categoryProviders.map((provider) => (
              <Link key={provider.id} href={`/provider/${provider.id}`} asChild>
                <TouchableOpacity style={styles.providerCard} activeOpacity={0.8}>
                  <View style={styles.providerAvatar}>
                    {provider.verified && (
                      <View style={styles.providerVerified}>
                        <Ionicons name="checkmark" size={10} color={COLORS.white} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
                  <View style={styles.providerRating}>
                    <RatingStars rating={provider.overallRating} size={11} />
                    <Text style={styles.providerRatingText}>{provider.overallRating}</Text>
                  </View>
                  <Badge level={provider.badgeLevel} size="sm" />
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
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
  headerContent: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatNum: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    gap: SPACING.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  jobsList: {
    gap: SPACING.md,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    alignItems: 'center',
  },
  jobIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: { flex: 1, gap: 4 },
  jobName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  jobDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 4,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  providerCard: {
    width: 130,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.divider,
  },
  providerVerified: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  providerRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
