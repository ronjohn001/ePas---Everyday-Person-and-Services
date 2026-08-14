import { useAuth } from '@/hooks/auth-store';
import { router, Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, SPACING, RADIUS, SHADOWS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { StatusBadge } from '@/components/StatusBadge';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/Badge';
import { FlashingTick } from '@/components/FlashingTick';
import {
  useProviderBookings,
  useReviewsForProvider,
  useProviderForUser,
  useUpdateBookingStatus,
  formatNLe,
} from '@/hooks/use-data';
import type { Booking } from '@/types';

const ACCEPTED_STATUSES: Booking['status'][] = ['ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
const UPCOMING_STATUSES: Booking['status'][] = ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'];

type InsightKey = 'performance' | 'earnings' | 'history';

export default function ProviderDashboardScreen() {
  const { user } = useAuth();
  const accent = ROLE_ACCENT.PROVIDER;
  const { data: provider } = useProviderForUser(user?.id);
  const providerId = provider?.id;
  const { data: bookings = [], refetch, isLoading } = useProviderBookings(providerId);
  const updateStatus = useUpdateBookingStatus();
  const [isHeroMinimised, setIsHeroMinimised] = useState(false);
  const [openInsight, setOpenInsight] = useState<InsightKey | null>(null);

  const handleRequestAction = (booking: Booking, accept: boolean) => {
    const next = accept ? 'ACCEPTED' : 'DECLINED';
    Alert.alert(
      accept ? 'Accept request' : 'Decline request',
      `${accept ? 'Accept' : 'Decline'} "${booking.serviceJobName}" for ${booking.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: accept ? 'Accept' : 'Decline',
          style: accept ? 'default' : 'destructive',
          onPress: () =>
            updateStatus.mutate(
              { bookingId: booking.id, status: next },
              { onError: (e) => Alert.alert('Error', (e as Error).message) },
            ),
        },
      ],
    );
  };

  const incoming = useMemo(() => bookings.filter((b) => b.status === 'REQUESTED'), [bookings]);
  const today = useMemo(() => {
    const todayStr = new Date().toDateString();
    return bookings.filter(
      (b) => new Date(b.scheduledDate).toDateString() === todayStr && b.status !== 'COMPLETED',
    );
  }, [bookings]);

  const upcoming = useMemo(() => bookings.filter((b) => UPCOMING_STATUSES.includes(b.status)), [bookings]);

  const profileCompleteness = provider ? Math.min(100, 40 + (provider.bio ? 15 : 0) + (provider.portfolioPhotos?.length ? 20 : 0) + (provider.certifications?.length ? 15 : 0) + (provider.serviceAreas.length > 1 ? 10 : 0)) : 0;

  const displayName = provider?.name ?? user?.name ?? 'Trader';
  const photoUri = provider?.profilePhoto ?? user?.profilePhoto;
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScreenBackground variant="provider">
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={accent.color} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] ?? 'Trader'}</Text>
              <View style={styles.roleRow}>
                <Text style={[styles.roleLabel, { color: accent.color }]}>Trader</Text>
                <FlashingTick size={13} color={accent.color} />
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => router.push('/notifications')}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications" size={20} color={COLORS.textPrimary} />
                <View style={[styles.notificationDot, { backgroundColor: accent.color }]} />
              </TouchableOpacity>
              <LogoutButton color={COLORS.textPrimary} />
            </View>
          </View>

          {/* Profile hero — photo, bio, rating */}
          <View style={styles.profileHero}>
            <View style={[styles.profileGlow, { backgroundColor: accent.glow }]} />
            {isHeroMinimised ? (
              <TouchableOpacity style={styles.heroMiniRow} onPress={() => setIsHeroMinimised(false)} activeOpacity={0.75}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.heroMiniAvatarImg} contentFit="cover" transition={200} />
                ) : (
                  <View style={[styles.heroMiniAvatar, { backgroundColor: `${accent.color}18`, borderColor: `${accent.color}35` }]}>
                    <Text style={[styles.heroMiniInitials, { color: accent.color }]}>{initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroMiniName} numberOfLines={1}>{displayName}</Text>
                  <Text style={styles.heroMiniMeta}>
                    {provider ? `${provider.overallRating.toFixed(1)}★ · ${provider.totalReviews} reviews · ${provider.completedJobs} jobs` : 'Trader profile'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ) : (
            <View style={styles.profileContent}>
              <View style={styles.profileTop}>
                <View style={styles.avatarWrap}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.avatarImg} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: `${accent.color}18`, borderColor: `${accent.color}35` }]}>
                      <Text style={[styles.avatarInitials, { color: accent.color }]}>{initials}</Text>
                    </View>
                  )}
                  {provider?.verified && (
                    <View style={[styles.verifiedDot, { backgroundColor: accent.color }]}>
                      <Ionicons name="checkmark" size={10} color={COLORS.textInverse} />
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
                  {provider && (
                    <View style={styles.profileMetaRow}>
                      <Badge level={provider.badgeLevel} size="sm" />
                      <Text style={styles.profileTier}>{provider.providerTier} tier</Text>
                    </View>
                  )}
                  {provider && (
                    <View style={styles.profileRatingRow}>
                      <RatingStars rating={provider.overallRating} size={12} color={COLORS.amber} />
                      <Text style={styles.profileRatingValue}>{provider.overallRating.toFixed(1)}</Text>
                      <Text style={styles.profileRatingMeta}>
                        · {provider.totalReviews} reviews · {provider.completedJobs} jobs
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.heroActionsCol}>
                  <TouchableOpacity
                    style={styles.minimiseBtn}
                    onPress={() => setIsHeroMinimised(true)}
                    hitSlop={8}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-up" size={15} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editBtn, { borderColor: `${accent.color}40`, backgroundColor: `${accent.color}12` }]}
                    onPress={() => router.push('/provider/onboarding')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={14} color={accent.color} />
                    <Text style={[styles.editBtnText, { color: accent.color }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {!!provider?.bio && (
                <Text style={styles.profileBio} numberOfLines={3}>{provider.bio}</Text>
              )}
              {!!provider && provider.serviceAreas.length > 0 && (
                <View style={styles.areasRow}>
                  <Ionicons name="location" size={11} color={COLORS.textTertiary} />
                  <Text style={styles.areasText} numberOfLines={1}>{provider.serviceAreas.join('  ·  ')}</Text>
                  {provider.experienceYears > 0 && (
                    <Text style={styles.experienceText}>{provider.experienceYears}y exp</Text>
                  )}
                </View>
              )}
            </View>
            )}
          </View>

          {/* My Activities — quick stats + shortcuts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Activities</Text>
            <View style={styles.actRow}>
              <ActivityTile
                icon="star"
                color={COLORS.amber}
                value={`${provider?.totalReviews ?? 0}`}
                label="Reviews"
                sub={provider && provider.totalReviews > 0 ? `${provider.overallRating.toFixed(1)}★ avg` : 'None yet'}
                onPress={() => router.push('/provider-reviews')}
              />
              <ActivityTile
                icon="file-tray-full"
                color={COLORS.sky}
                value={`${incoming.length}`}
                label="Requests"
                sub={incoming.length > 0 ? 'awaiting reply' : 'none pending'}
                onPress={() => router.push('/provider-jobs')}
              />
              <ActivityTile
                icon="today"
                color={accent.color}
                value={`${today.length}`}
                label="Today"
                sub="scheduled"
                onPress={() => router.push('/provider-jobs')}
              />
              <ActivityTile
                icon="calendar"
                color={COLORS.violet}
                value={`${upcoming.length}`}
                label="Calendar"
                sub="upcoming"
                onPress={() => router.push('/calendar')}
              />
            </View>
          </View>

          {/* Searches — heavier insights live behind buttons and mount on demand */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Searches</Text>
            <View style={styles.insightRow}>
              <InsightToggle
                icon="stats-chart"
                label="Performance"
                color={COLORS.sky}
                active={openInsight === 'performance'}
                onPress={() => setOpenInsight(openInsight === 'performance' ? null : 'performance')}
              />
              <InsightToggle
                icon="wallet"
                label="Earnings"
                color={COLORS.accent}
                active={openInsight === 'earnings'}
                onPress={() => setOpenInsight(openInsight === 'earnings' ? null : 'earnings')}
              />
              <InsightToggle
                icon="time"
                label="History"
                color={COLORS.violet}
                active={openInsight === 'history'}
                onPress={() => setOpenInsight(openInsight === 'history' ? null : 'history')}
              />
            </View>
            {openInsight === 'performance' && (
              <PerformancePanel
                providerId={providerId}
                bookings={bookings}
                accent={accent.color}
                fallbackRating={provider?.overallRating ?? 0}
              />
            )}
            {openInsight === 'earnings' && <EarningsPanel bookings={bookings} accent={accent.color} />}
            {openInsight === 'history' && <HistoryPanel bookings={bookings} accent={accent.color} />}
          </View>

          {/* Incoming requests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Incoming Requests</Text>
              <View style={[styles.countPill, { backgroundColor: `${accent.color}20`, borderColor: `${accent.color}40` }]}>
                <Text style={[styles.countPillText, { color: accent.color }]}>{incoming.length}</Text>
              </View>
            </View>
            {incoming.length > 0 ? (
              <View style={styles.list}>
                {incoming.map((b) => (
                  <BookingRequestCard
                    key={b.id}
                    booking={b}
                    accent={accent.color}
                    onAction={handleRequestAction}
                    busy={updateStatus.isPending}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle" size={32} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>No pending requests</Text>
                <Text style={styles.emptyDesc}>New booking requests will appear here</Text>
              </View>
            )}
          </View>

          {/* Today's agenda */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Agenda</Text>
            {today.length > 0 ? (
              <View style={styles.list}>
                {today.map((b) => (
                  <Link key={b.id} href={`/booking/${b.id}`} asChild>
                    <TouchableOpacity style={styles.agendaCard} activeOpacity={0.7}>
                      <View style={[styles.agendaIcon, { backgroundColor: `${b.serviceJobColor}20`, borderColor: `${b.serviceJobColor}40` }]}>
                        <Ionicons name={b.serviceJobIcon as any} size={18} color={b.serviceJobColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.agendaService}>{b.serviceJobName}</Text>
                        <Text style={styles.agendaCustomer}>{b.customerName}</Text>
                        <Text style={styles.agendaTime}>
                          {new Date(b.scheduledDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          {' · '}{b.address}
                        </Text>
                      </View>
                      <StatusBadge status={b.status} />
                    </TouchableOpacity>
                  </Link>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={32} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>Nothing scheduled today</Text>
                <Text style={styles.emptyDesc}>Your day is clear</Text>
              </View>
            )}
          </View>

          {/* Profile completeness */}
          {provider && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Completeness</Text>
              <View style={styles.completenessCard}>
                <View style={styles.completenessRow}>
                  <Text style={styles.completenessValue}>{profileCompleteness}%</Text>
                  <TouchableOpacity
                    style={[styles.improveBtn, { borderColor: `${accent.color}40` }]}
                    onPress={() => router.push('/provider/onboarding')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.improveBtnText, { color: accent.color }]}>Improve</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${profileCompleteness}%`, backgroundColor: accent.color }]} />
                </View>
                <Text style={styles.completenessHint}>Complete profiles get 3x more bookings</Text>
              </View>
            </View>
          )}

          <View style={{ height: SPACING.xxl + 60 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function StatTile({ icon, color, value, label, sub }: { icon: string; color: string; value: string; label: string; sub: string }) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statSub, { color }]}>{sub}</Text>
    </View>
  );
}

function EarningsCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={styles.earningsCard}>
      <Text style={styles.earningsLabel}>{label}</Text>
      <Text style={[styles.earningsValue, { color: accent }]}>{formatNLe(value)}</Text>
    </View>
  );
}

function ActivityTile({
  icon,
  color,
  value,
  label,
  sub,
  onPress,
}: {
  icon: string;
  color: string;
  value: string;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actTile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actIcon, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.actValue}>{value}</Text>
      <Text style={styles.actLabel}>{label}</Text>
      {!!sub && <Text style={[styles.actSub, { color }]} numberOfLines={1}>{sub}</Text>}
    </TouchableOpacity>
  );
}

function InsightToggle({ icon, color, label, active, onPress }: { icon: string; color: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.insightToggle, active && { borderColor: `${color}55`, backgroundColor: `${color}14` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={14} color={active ? color : COLORS.textTertiary} />
      <Text style={[styles.insightToggleLabel, active && { color: COLORS.textPrimary }]} numberOfLines={1}>{label}</Text>
      <Ionicons name={active ? 'chevron-up' : 'chevron-down'} size={12} color={active ? color : COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

function PanelHeader({ title, accent, linkText, onLinkPress }: { title: string; accent: string; linkText?: string; onLinkPress?: () => void }) {
  return (
    <View style={styles.panelHeader}>
      <Text style={styles.panelTitle}>{title}</Text>
      {!!linkText && (
        <TouchableOpacity onPress={onLinkPress} activeOpacity={0.7}>
          <Text style={[styles.panelLink, { color: accent }]}>{linkText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PerformancePanel({ providerId, bookings, accent, fallbackRating }: { providerId: string | undefined; bookings: Booking[]; accent: string; fallbackRating: number }) {
  const { data: reviews = [] } = useReviewsForProvider(providerId);

  const completed = useMemo(() => bookings.filter((b) => b.status === 'COMPLETED'), [bookings]);
  const decided = useMemo(
    () => bookings.filter((b) => ACCEPTED_STATUSES.includes(b.status) || b.status === 'DECLINED'),
    [bookings],
  );
  const acceptedCount = useMemo(
    () => bookings.filter((b) => ACCEPTED_STATUSES.includes(b.status)).length,
    [bookings],
  );
  const acceptancePct = decided.length > 0 ? Math.round((acceptedCount / decided.length) * 100) : 100;

  const finishedScope = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'DISPUTED'),
    [bookings],
  );
  const completionPct = finishedScope.length > 0 ? Math.round((completed.length / finishedScope.length) * 100) : 100;

  const totalEarned = useMemo(() => completed.reduce((s, b) => s + b.providerPayout, 0), [completed]);

  const earningsMonth = useMemo(() => {
    const monthAgo = Date.now() - 30 * 86400000;
    return bookings
      .filter((b) => b.status === 'COMPLETED' && new Date(b.completedAt ?? b.createdAt).getTime() > monthAgo)
      .reduce((s, b) => s + b.providerPayout, 0);
  }, [bookings]);

  const avgRating = useMemo(
    () => (reviews.length > 0 ? reviews.reduce((s, r) => s + r.overall, 0) / reviews.length : fallbackRating),
    [reviews, fallbackRating],
  );
  const positivePct = useMemo(
    () => (reviews.length > 0 ? Math.round((reviews.filter((r) => r.overall >= 4).length / reviews.length) * 100) : 0),
    [reviews],
  );

  return (
    <View style={styles.panelBody}>
      <PanelHeader title="Your Performance" accent={accent} />
      <View style={styles.statsGrid}>
        <StatTile
          icon="checkmark-done"
          color={COLORS.accent}
          value={`${completed.length}`}
          label="Jobs Done"
          sub={`${completionPct}% completion rate`}
        />
        <StatTile
          icon="thumbs-up"
          color={COLORS.cyan}
          value={`${acceptancePct}%`}
          label="Acceptance"
          sub={`${acceptedCount} of ${decided.length} requests`}
        />
        <StatTile
          icon="star"
          color={COLORS.amber}
          value={`${reviews.length}`}
          label="Reviews"
          sub={reviews.length > 0 ? `${avgRating.toFixed(1)}★ · ${positivePct}% positive` : 'No reviews yet'}
        />
        <StatTile
          icon="wallet"
          color={COLORS.magenta}
          value={formatNLe(totalEarned)}
          label="Total Earned"
          sub={`${formatNLe(earningsMonth)} this month`}
        />
      </View>
    </View>
  );
}

function EarningsPanel({ bookings, accent }: { bookings: Booking[]; accent: string }) {
  const earningsToday = useMemo(() => {
    const todayStr = new Date().toDateString();
    return bookings
      .filter((b) => b.status === 'COMPLETED' && new Date(b.completedAt ?? b.createdAt).toDateString() === todayStr)
      .reduce((s, b) => s + b.providerPayout, 0);
  }, [bookings]);

  const earningsWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return bookings
      .filter((b) => b.status === 'COMPLETED' && new Date(b.completedAt ?? b.createdAt).getTime() > weekAgo)
      .reduce((s, b) => s + b.providerPayout, 0);
  }, [bookings]);

  const earningsMonth = useMemo(() => {
    const monthAgo = Date.now() - 30 * 86400000;
    return bookings
      .filter((b) => b.status === 'COMPLETED' && new Date(b.completedAt ?? b.createdAt).getTime() > monthAgo)
      .reduce((s, b) => s + b.providerPayout, 0);
  }, [bookings]);

  return (
    <View style={styles.panelBody}>
      <PanelHeader title="Earnings" accent={accent} />
      <View style={styles.earningsRow}>
        <EarningsCard label="Today" value={earningsToday} accent={accent} />
        <EarningsCard label="This Week" value={earningsWeek} accent={accent} />
        <EarningsCard label="This Month" value={earningsMonth} accent={accent} />
      </View>
    </View>
  );
}

function HistoryPanel({ bookings, accent }: { bookings: Booking[]; accent: string }) {
  const workHistory = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'COMPLETED')
        .sort((a, b) => new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime())
        .slice(0, 4),
    [bookings],
  );

  return (
    <View style={styles.panelBody}>
      <PanelHeader title="Work History" accent={accent} linkText="All Jobs" onLinkPress={() => router.push('/provider-jobs')} />
      {workHistory.length > 0 ? (
        <View style={styles.list}>
          {workHistory.map((b) => (
            <Link key={b.id} href={`/booking/${b.id}`} asChild>
              <TouchableOpacity style={styles.historyCard} activeOpacity={0.7}>
                <View style={[styles.agendaIcon, { backgroundColor: `${b.serviceJobColor}20`, borderColor: `${b.serviceJobColor}40` }]}>
                  <Ionicons name={b.serviceJobIcon as any} size={18} color={b.serviceJobColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyService}>{b.serviceJobName}</Text>
                  <Text style={styles.historyCustomer}>{b.customerName}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(b.completedAt ?? b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {b.hasReview ? ' · Reviewed' : ''}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyPayout, { color: accent }]}>{formatNLe(b.providerPayout)}</Text>
                  <Text style={styles.historyPayoutLabel}>earned</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="briefcase-outline" size={32} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>No completed jobs yet</Text>
          <Text style={styles.emptyDesc}>Finished jobs will show up here</Text>
        </View>
      )}
    </View>
  );
}

function BookingRequestCard({
  booking,
  accent,
  onAction,
  busy,
}: {
  booking: Booking;
  accent: string;
  onAction: (booking: Booking, accept: boolean) => void;
  busy: boolean;
}) {
  return (
    <Link href={`/booking/${booking.id}`} asChild>
      <TouchableOpacity style={styles.requestCard} activeOpacity={0.7}>
        <View style={[styles.requestGlow, { backgroundColor: `${accent}15` }]} />
        <View style={styles.requestContent}>
          <View style={styles.requestTop}>
            <View style={[styles.requestIcon, { backgroundColor: `${booking.serviceJobColor}20`, borderColor: `${booking.serviceJobColor}40` }]}>
              <Ionicons name={booking.serviceJobIcon as any} size={20} color={booking.serviceJobColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestService}>{booking.serviceJobName}</Text>
              <Text style={styles.requestCustomer}>{booking.customerName}</Text>
              <Text style={styles.requestAddress}>{booking.address}</Text>
            </View>
            <Text style={[styles.requestPrice, { color: accent }]}>{formatNLe(booking.finalPrice)}</Text>
          </View>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.requestBtn, styles.declineBtn]}
              activeOpacity={0.7}
              disabled={busy}
              onPress={() => onAction(booking, false)}
            >
              <Ionicons name="close" size={14} color={COLORS.error} />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.requestBtn, { backgroundColor: accent, borderColor: accent }]}
              activeOpacity={0.7}
              disabled={busy}
              onPress={() => onAction(booking, true)}
            >
              <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
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
  greeting: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  roleLabel: { fontSize: 13, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.glassBgLight, borderWidth: 1, borderColor: COLORS.glassBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: COLORS.surface,
  },
  profileHero: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg, ...SHADOWS.glowCyan,
  },
  profileGlow: { ...StyleSheet.absoluteFillObject },
  profileContent: { padding: SPACING.lg, gap: SPACING.sm, position: 'relative', zIndex: 1 },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 22, fontWeight: '800' },
  verifiedDot: {
    position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.surface,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  profileTier: { fontSize: 11, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'capitalize' },
  profileRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileRatingValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  profileRatingMeta: { fontSize: 11, color: COLORS.textTertiary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill, borderWidth: 1,
  },
  editBtnText: { fontSize: 11, fontWeight: '700' },
  profileBio: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  heroMiniRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, position: 'relative', zIndex: 1,
  },
  heroMiniAvatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  heroMiniAvatarImg: { width: 34, height: 34, borderRadius: 17 },
  heroMiniInitials: { fontSize: 13, fontWeight: '800' },
  heroMiniName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  heroMiniMeta: { fontSize: 11.5, color: COLORS.textTertiary, marginTop: 1 },
  heroActionsCol: { alignItems: 'flex-end', gap: 6 },
  minimiseBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: COLORS.glassBorder, justifyContent: 'center', alignItems: 'center',
  },
  areasRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  areasText: { flex: 1, fontSize: 11, color: COLORS.textTertiary },
  experienceText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  countPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.pill, borderWidth: 1 },
  countPillText: { fontSize: 12, fontWeight: '700' },
  insightRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  insightToggle: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, paddingHorizontal: 4, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  insightToggleLabel: { fontSize: 11.5, fontWeight: '700', color: COLORS.textSecondary },
  panelBody: { marginTop: SPACING.md, gap: SPACING.sm },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  panelLink: { fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statTile: {
    width: '48%', flexGrow: 1, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: 3, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  statIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  statSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  earningsRow: { flexDirection: 'row', gap: SPACING.sm },
  earningsCard: {
    flex: 1, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.glassBorder, gap: 4,
  },
  earningsLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  earningsValue: { fontSize: 17, fontWeight: '800' },
  actRow: { flexDirection: 'row', gap: SPACING.sm },
  actTile: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, paddingHorizontal: 6, gap: 2, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  actIcon: {
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 4,
  },
  actValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  actLabel: { fontSize: 10.5, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  actSub: { fontSize: 10, fontWeight: '600' },
  list: { gap: SPACING.sm },
  requestCard: {
    borderRadius: RADIUS.lg, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg,
  },
  requestGlow: { ...StyleSheet.absoluteFillObject },
  requestContent: { position: 'relative', zIndex: 1, padding: SPACING.md, gap: SPACING.md },
  requestTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  requestIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  requestService: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  requestCustomer: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  requestAddress: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  requestPrice: { fontSize: 16, fontWeight: '800' },
  requestActions: { flexDirection: 'row', gap: SPACING.sm },
  requestBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: RADIUS.md, gap: 6, borderWidth: 1,
  },
  declineBtn: { backgroundColor: 'rgba(255,92,122,0.08)', borderColor: 'rgba(255,92,122,0.25)' },
  declineBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.error },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textInverse },
  agendaCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  agendaIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  agendaService: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  agendaCustomer: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  agendaTime: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  historyService: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  historyCustomer: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  historyDate: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 1 },
  historyPayout: { fontSize: 15, fontWeight: '800' },
  historyPayoutLabel: { fontSize: 10, color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.4 },
  emptyCard: {
    alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs,
    backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.xs },
  emptyDesc: { fontSize: 12, color: COLORS.textTertiary },
  completenessCard: {
    backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.glassBorder, gap: SPACING.sm,
  },
  completenessRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  completenessValue: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  improveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.pill, borderWidth: 1 },
  improveBtnText: { fontSize: 12, fontWeight: '700' },
  progressBarBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  completenessHint: { fontSize: 12, color: COLORS.textTertiary },
});
