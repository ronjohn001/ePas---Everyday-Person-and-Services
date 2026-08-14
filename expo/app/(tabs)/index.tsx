import { useAuth } from '@/hooks/auth-store';
import { router, Link, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS, ROLE_ACCENT } from '@/constants/colors';
import { formatNLe } from '@/data/mock';
import { useAds } from '@/hooks/ad-store';
import { useCatalog } from '@/hooks/catalog-store';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/Badge';
import { ScreenBackground } from '@/components/ScreenBackground';
import { FlashingTick } from '@/components/FlashingTick';
import { LogoutButton } from '@/components/LogoutButton';
import { Image } from 'expo-image';
import { useCategories, useAllJobs, useProviders, useSearchProviders, useCustomerBookings, useLoyalty, useReviewsByCustomer } from '@/hooks/use-data';
import { useQueryClient } from '@tanstack/react-query';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = SPACING.md;
const CONTENT_PADDING = SPACING.lg;
const CARD_WIDTH = (SCREEN_WIDTH - CONTENT_PADDING * 2 - CARD_GAP) / 2;

type SearchSectionKey = 'categories' | 'traders' | 'popular';

export default function HomeScreen() {
  const { user } = useAuth();
  const { activeAdverts } = useAds();
  const { search } = useLocalSearchParams<{ search?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: myBookings = [] } = useCustomerBookings(user?.id);
  const { data: loyalty } = useLoyalty(user?.id);
  const { data: myReviews = [] } = useReviewsByCustomer(user?.id);
  const [activeAdvert, setActiveAdvert] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isHeroMinimised, setIsHeroMinimised] = useState(false);
  const [openSearch, setOpenSearch] = useState<SearchSectionKey | null>(null);
  const queryClient = useQueryClient();

  // Deep-linked from a Favourites "recent search" chip — pre-fill the search bar
  useEffect(() => {
    if (typeof search === 'string' && search.trim().length > 0) {
      setSearchQuery(search);
    }
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries().finally(() => setRefreshing(false));
  }, [queryClient]);

  const greeting = user?.name?.split(' ')[0] ?? 'there';
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const myActive = useMemo(
    () => myBookings.filter((b) => ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(b.status)),
    [myBookings]
  );
  const pendingReviewCount = useMemo(
    () => myBookings.filter((b) => b.status === 'COMPLETED' && !b.hasReview).length,
    [myBookings]
  );
  const favTraderCount = useMemo(() => new Set(myBookings.map((b) => b.providerId)).size, [myBookings]);
  const loyaltyBalance = loyalty?.balance ?? 0;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {/* Header — greeting, actions, search */}
          <View style={styles.header}>
            <View style={styles.headerGlass}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,31,58,0.6)' }]} />
              )}
              <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.greeting}>Hello, {greeting}</Text>
                    <View style={styles.roleRow}>
                      <Text style={styles.roleLabel}>Customer</Text>
                      <FlashingTick size={12} color={COLORS.accent} />
                    </View>
                  </View>
                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      style={styles.notificationBtn}
                      onPress={() => router.push('/notifications')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="notifications" size={20} color={COLORS.textPrimary} />
                      <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <LogoutButton color={COLORS.textPrimary} />
                  </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={18} color={COLORS.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search services or traders..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Profile hero — in view on open, minimisable */}
          {!searchQuery && (
            isHeroMinimised ? (
              <TouchableOpacity style={styles.heroMini} onPress={() => setIsHeroMinimised(false)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Expand profile">
                {user?.profilePhoto ? (
                  <Image source={{ uri: user.profilePhoto }} style={styles.heroMiniAvatarImg} contentFit="cover" transition={200} />
                ) : (
                  <View style={styles.heroMiniAvatar}>
                    <Text style={styles.heroMiniInitials}>{initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroMiniName} numberOfLines={1}>{user?.name ?? 'Customer'}</Text>
                  <Text style={styles.heroMiniMeta}>
                    {loyaltyBalance} pts{user?.phone ? ` · ${user.phone}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.heroCard}>
                <View style={styles.heroGlow} />
                <View style={styles.heroBody}>
                  <View style={styles.heroTop}>
                    {user?.profilePhoto ? (
                      <Image source={{ uri: user.profilePhoto }} style={styles.heroAvatarImg} contentFit="cover" transition={200} />
                    ) : (
                      <View style={styles.heroAvatar}>
                        <Text style={styles.heroInitials}>{initials}</Text>
                      </View>
                    )}
                    <View style={styles.heroInfo}>
                      <Text style={styles.heroName} numberOfLines={1}>{user?.name ?? 'Customer'}</Text>
                      {!!user?.phone && (
                        <View style={styles.heroMetaRow}>
                          <Ionicons name="call" size={11} color={COLORS.textTertiary} />
                          <Text style={styles.heroMetaText}>{user.phone}</Text>
                        </View>
                      )}
                      <View style={styles.heroMetaRow}>
                        <Ionicons name="gift" size={11} color={COLORS.violet} />
                        <Text style={[styles.heroMetaText, { color: COLORS.violet }]}>{loyaltyBalance} loyalty points</Text>
                      </View>
                    </View>
                    <View style={styles.heroActionsCol}>
                      <TouchableOpacity
                        style={styles.heroIconBtn}
                        onPress={() => setIsHeroMinimised(true)}
                        hitSlop={8}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Minimise profile"
                      >
                        <Ionicons name="chevron-up" size={16} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.heroIconBtn}
                        onPress={() => router.push('/(tabs)/profile')}
                        hitSlop={8}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={15} color={COLORS.accent} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )
          )}

          {/* Activity shortcuts — all current activities live behind these */}
          {!searchQuery && (
            <View style={styles.shortcutRow}>
              <ShortcutTile
                icon="briefcase"
                color={COLORS.accent}
                value={`${myBookings.length}`}
                label="My Bookings"
                sub={`${myActive.length} active`}
                onPress={() => router.push('/(tabs)/bookings')}
              />
              <ShortcutTile
                icon="calendar"
                color={COLORS.sky}
                value={`${myActive.length}`}
                label="Calendar"
                sub="upcoming"
                onPress={() => router.push('/calendar')}
              />
              <ShortcutTile
                icon="star"
                color={COLORS.amber}
                value={`${myReviews.length}`}
                label="Reviews"
                sub={pendingReviewCount > 0 ? `${pendingReviewCount} to rate` : 'given'}
                onPress={() => router.push('/my-reviews')}
              />
              <ShortcutTile
                icon="heart"
                color={COLORS.magenta}
                value={`${favTraderCount}`}
                label="Favourite"
                sub="traders"
                onPress={() => router.push('/favourites')}
              />
            </View>
          )}

          {/* Search results — mounted on demand while the customer types */}
          {searchQuery.length > 0 && (
            <SearchResults query={searchQuery} onSelect={() => setSearchQuery('')} />
          )}

          {/* Advert carousel */}
          {!searchQuery && (
            <View style={styles.advertSection}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - CONTENT_PADDING * 2));
                  setActiveAdvert(idx);
                }}
                scrollEventThrottle={16}
              >
                {activeAdverts.map((ad) => (
                  <TouchableOpacity
                    key={ad.id}
                    style={styles.advertCard}
                    activeOpacity={0.92}
                    onPress={() => {
                      if (ad.linkRoute && ad.linkRoute.startsWith('/')) {
                        router.push(ad.linkRoute as any);
                      }
                    }}
                  >
                    <AdvertBackground ad={ad} />
                    <View style={[styles.advertOverlay, { opacity: ad.overlayOpacity }]} />
                    <View style={[
                      styles.advertContent,
                      ad.textPosition === 'top' ? { justifyContent: 'flex-start' } : ad.textPosition === 'center' ? { justifyContent: 'center' } : { justifyContent: 'flex-end' }
                    ]}>
                      <View style={styles.advertTextWrap}>
                        <Text style={styles.advertTitle}>{ad.title}</Text>
                        <Text style={styles.advertSubtitle}>{ad.subtitle}</Text>
                      </View>
                      <View style={styles.advertCta}>
                        <Text style={styles.advertCtaText}>{ad.ctaText}</Text>
                        <Ionicons name="arrow-forward" size={13} color={COLORS.white} />
                      </View>
                    </View>
                    <View style={styles.advertIcon}>
                      <Ionicons name={ad.icon as any} size={44} color="rgba(255,255,255,0.25)" />
                    </View>
                    {ad.backgroundType === 'video' && (
                      <View style={styles.videoBadge}>
                        <Ionicons name="videocam" size={12} color={COLORS.white} />
                        <Text style={styles.videoBadgeText}>Video</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.advertDots}>
                {activeAdverts.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.advertDot, i === activeAdvert && styles.advertDotActive]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Searches — discovery sections live behind buttons and mount on demand */}
          {!searchQuery && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Searches</Text>
              <View style={styles.searchToggleRow}>
                <SearchToggle
                  icon="grid"
                  label="Categories"
                  color={COLORS.accent}
                  active={openSearch === 'categories'}
                  onPress={() => setOpenSearch(openSearch === 'categories' ? null : 'categories')}
                />
                <SearchToggle
                  icon="trophy"
                  label="Top Traders"
                  color={COLORS.amber}
                  active={openSearch === 'traders'}
                  onPress={() => setOpenSearch(openSearch === 'traders' ? null : 'traders')}
                />
                <SearchToggle
                  icon="flame"
                  label="Popular"
                  color={COLORS.magenta}
                  active={openSearch === 'popular'}
                  onPress={() => setOpenSearch(openSearch === 'popular' ? null : 'popular')}
                />
              </View>
              {openSearch === 'categories' && <CategoriesPanel />}
              {openSearch === 'traders' && <TopTradersPanel />}
              {openSearch === 'popular' && <PopularServicesPanel />}
            </View>
          )}

          {/* Suggest a provider */}
          {!searchQuery && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.suggestCard}
                onPress={() => router.push('/provider-suggestion')}
                activeOpacity={0.82}
              >
                <View style={styles.suggestIconWrap}>
                  <Ionicons name="person-add" size={22} color={COLORS.accent} />
                </View>
                <View style={styles.suggestTextWrap}>
                  <Text style={styles.suggestTitle}>Know a great provider?</Text>
                  <View style={styles.suggestSubRow}>
                    <Text style={styles.suggestSub}>Suggest them to join ePaS</Text>
                    <FlashingTick size={13} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ShortcutTile({ icon, color, value, label, sub, onPress }: { icon: string; color: string; value: string; label: string; sub?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.shortcutTile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.shortcutIcon, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
        <Ionicons name={icon as any} size={15} color={color} />
      </View>
      <Text style={styles.shortcutValue}>{value}</Text>
      <Text style={styles.shortcutLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{label}</Text>
      {!!sub && <Text style={[styles.shortcutSub, { color }]} numberOfLines={1}>{sub}</Text>}
    </TouchableOpacity>
  );
}

function SearchToggle({ icon, color, label, active, onPress }: { icon: string; color: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.searchToggle, active && { borderColor: `${color}55`, backgroundColor: `${color}14` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={14} color={active ? color : COLORS.textTertiary} />
      <Text style={[styles.searchToggleLabel, active && { color: COLORS.textPrimary }]} numberOfLines={1}>{label}</Text>
      <Ionicons name={active ? 'chevron-up' : 'chevron-down'} size={12} color={active ? color : COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

function PanelLoading() {
  return (
    <View style={styles.panelLoading}>
      <ActivityIndicator color={COLORS.accent} />
    </View>
  );
}

function CategoriesPanel() {
  const { data: categories = [], isLoading } = useCategories();
  if (isLoading) {
    return <View style={styles.searchPanel}><PanelLoading /></View>;
  }
  return (
    <View style={styles.searchPanel}>
      <View style={styles.panelHeaderRow}>
        <Text style={styles.panelTitle}>Browse Categories</Text>
        <Text style={styles.sectionCount}>{categories.length} services</Text>
      </View>
      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.id}`} asChild>
            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.7}>
              <View style={[styles.categoryIconBg, { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}30` }]}>
                <Ionicons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.serviceCount} services</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
}

function TopTradersPanel() {
  const { data: providers = [], isLoading } = useProviders();
  const featuredProviders = useMemo(
    () => [...providers].sort((a, b) => b.overallRating - a.overallRating).slice(0, 6),
    [providers]
  );
  if (isLoading) {
    return <View style={styles.searchPanel}><PanelLoading /></View>;
  }
  return (
    <View style={styles.searchPanel}>
      <View style={styles.panelHeaderRow}>
        <Text style={styles.panelTitle}>Top Rated Traders</Text>
        <Text style={styles.sectionCount}>{providers.length} traders</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featuredProviders.map((provider) => (
          <Link key={provider.id} href={`/provider/${provider.id}`} asChild>
            <TouchableOpacity style={styles.providerCard} activeOpacity={0.8}>
              <View style={styles.providerCardTop}>
                <View style={styles.providerAvatar}>
                  <Ionicons name="person" size={28} color={COLORS.textTertiary} />
                </View>
                {provider.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={15} color={COLORS.accent} />
                  </View>
                )}
              </View>
              <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
              <View style={styles.providerRating}>
                <RatingStars rating={provider.overallRating} size={11} />
                <Text style={styles.providerRatingText}>{provider.overallRating}</Text>
              </View>
              <Badge level={provider.badgeLevel} size="sm" />
              <Text style={provider.completedJobs > 50 ? styles.providerJobsHighlight : styles.providerJobs}>
                {provider.completedJobs} jobs completed
              </Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

function PopularServicesPanel() {
  const { data: allJobs = [], isLoading } = useAllJobs();
  const { data: categories = [] } = useCategories();
  if (isLoading) {
    return <View style={styles.searchPanel}><PanelLoading /></View>;
  }
  return (
    <View style={styles.searchPanel}>
      <View style={styles.panelHeaderRow}>
        <Text style={styles.panelTitle}>Popular Services</Text>
      </View>
      <View style={styles.popularGrid}>
        {allJobs.slice(0, 4).map((job) => {
          const cat = categories.find(c => c.id === job.categoryId);
          return (
            <Link key={job.id} href={`/category/${job.categoryId}`} asChild>
              <TouchableOpacity style={styles.popularCard} activeOpacity={0.8}>
                <View style={[styles.popularIcon, { backgroundColor: `${job.color}20`, borderColor: `${job.color}30` }]}>
                  <Ionicons name={job.icon as any} size={22} color={job.color} />
                </View>
                <Text style={styles.popularName} numberOfLines={2}>{job.name}</Text>
                <Text style={styles.popularCat}>{cat?.name}</Text>
                <Text style={styles.popularPrice}>{formatNLe(job.basePrice)}</Text>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function SearchResults({ query, onSelect }: { query: string; onSelect: () => void }) {
  const { addRecentSearch } = useCatalog();
  const { data: allJobs = [] } = useAllJobs();
  const { data: categories = [] } = useCategories();
  const { data: searchedProviders = [] } = useSearchProviders(query);

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allJobs.filter(
      j => j.name.toLowerCase().includes(q) || j.description.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, allJobs]);

  const handleSelect = () => {
    addRecentSearch(query);
    onSelect();
  };

  if (filteredJobs.length === 0 && searchedProviders.length === 0) return null;

  return (
    <>
      {filteredJobs.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsTitle}>Services</Text>
          {filteredJobs.map((job) => {
            const cat = categories.find(c => c.id === job.categoryId);
            return (
              <Link key={job.id} href={`/category/${job.categoryId}`} asChild>
                <TouchableOpacity style={styles.searchResultItem} onPress={handleSelect} activeOpacity={0.7}>
                  <View style={[styles.searchResultIcon, { backgroundColor: `${job.color}20`, borderColor: `${job.color}30` }]}>
                    <Ionicons name={job.icon as any} size={18} color={job.color} />
                  </View>
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName}>{job.name}</Text>
                    <Text style={styles.searchResultCat}>{cat?.name} · {formatNLe(job.basePrice)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
      )}
      {searchedProviders.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsTitle}>Traders</Text>
          {searchedProviders.map((p) => (
            <Link key={p.id} href={`/provider/${p.id}`} asChild>
              <TouchableOpacity style={styles.searchResultItem} onPress={handleSelect} activeOpacity={0.7}>
                <View style={[styles.searchResultIcon, { backgroundColor: 'rgba(34,229,255,0.12)', borderColor: 'rgba(34,229,255,0.25)' }]}>
                  <Ionicons name="person" size={18} color={COLORS.cyan} />
                </View>
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{p.name}</Text>
                  <Text style={styles.searchResultCat}>
                    {p.serviceAreas.slice(0, 2).join(', ') || 'Trader'} · {p.overallRating.toFixed(1)}★
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}
    </>
  );
}

function AdvertBackground({ ad }: { ad: import('@/types').Advertisement }) {
  if (ad.backgroundType === 'image' && ad.backgroundImage) {
    return (
      <Image
        source={{ uri: ad.backgroundImage }}
        style={styles.advertBackground}
        contentFit="cover"
        transition={300}
      />
    );
  }
  if (ad.backgroundType === 'video') {
    return (
      <View style={[styles.advertBackground, { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="videocam" size={48} color="rgba(255,255,255,0.25)" />
        <Text style={styles.videoPlaceholderText}>Background video</Text>
      </View>
    );
  }
  return (
    <LinearGradient
      colors={ad.gradient as [string, string]}
      style={styles.advertBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: { paddingHorizontal: CONTENT_PADDING, paddingTop: SPACING.sm },
  headerGlass: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  headerContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  roleLabel: { fontSize: 12.5, fontWeight: '700', color: COLORS.accent },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.glassBgLight,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  // Profile hero — minimisable
  heroCard: {
    marginHorizontal: CONTENT_PADDING,
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
  },
  heroGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: ROLE_ACCENT.CUSTOMER.glow },
  heroBody: { padding: SPACING.md, position: 'relative', zIndex: 1 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,255,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAvatarImg: { width: 56, height: 56, borderRadius: 28 },
  heroInitials: { fontSize: 19, fontWeight: '800', color: COLORS.accent },
  heroInfo: { flex: 1, gap: 3 },
  heroName: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  heroActionsCol: { gap: 6 },
  heroIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: CONTENT_PADDING,
    marginTop: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  heroMiniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,255,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMiniAvatarImg: { width: 34, height: 34, borderRadius: 17 },
  heroMiniInitials: { fontSize: 13, fontWeight: '800', color: COLORS.accent },
  heroMiniName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  heroMiniMeta: { fontSize: 11.5, color: COLORS.textTertiary, marginTop: 1 },

  // Activity shortcut row
  shortcutRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: CONTENT_PADDING,
    marginTop: SPACING.md,
  },
  shortcutTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  shortcutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 3,
  },
  shortcutValue: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  shortcutLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  shortcutSub: { fontSize: 10, fontWeight: '600' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Search results
  searchResults: {
    marginHorizontal: CONTENT_PADDING,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  searchResultsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  searchResultIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchResultText: { flex: 1 },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchResultCat: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Advert
  advertSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: CONTENT_PADDING,
  },
  advertCard: {
    width: SCREEN_WIDTH - CONTENT_PADDING * 2,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  advertBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  advertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  advertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    minHeight: 140,
    gap: SPACING.sm,
    zIndex: 1,
  },
  advertTextWrap: { flex: 1 },
  advertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  advertSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  advertCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  advertCtaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  advertIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    zIndex: 0,
  },
  videoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  videoBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  videoPlaceholderText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  advertDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  advertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  advertDotActive: {
    width: 20,
    backgroundColor: COLORS.accent,
  },

  // Sections
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: CONTENT_PADDING,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },

  // Searches toggle row + lazy panels
  searchToggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  searchToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  searchToggleLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  searchPanel: {
    marginTop: SPACING.md,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  panelLoading: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  categoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },

  // Provider cards
  providerCard: {
    width: 136,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  providerCardTop: {
    position: 'relative',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    right: 26,
    bottom: 0,
  },
  providerName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerRatingText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  providerJobs: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  providerJobsHighlight: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Popular
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  popularCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  popularIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  popularName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  popularCat: {
    fontSize: 11.5,
    color: COLORS.textTertiary,
  },
  popularPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },

  // Suggest
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  suggestIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,217,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,163,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestTextWrap: { flex: 1 },
  suggestTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  suggestSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
});
