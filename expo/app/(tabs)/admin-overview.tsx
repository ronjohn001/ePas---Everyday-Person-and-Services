import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { COLORS, SPACING, RADIUS, SHADOWS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { FlashingTick } from '@/components/FlashingTick';
import {
  useAdminKpis,
  useCategories,
  useDisputes,
  useAppealedReviews,
  useSuggestions,
  useUpdateSuggestionStatus,
  formatNLe,
} from '@/hooks/use-data';
import type { ProviderSuggestion } from '@/types';

/**
 * Admin Dashboard — the single admin home.
 * GMV hero on top, six equal navigation tiles (Users, Traders, Active Bookings,
 * Completed, Reviews, Service Categories), then Adverts and Provider Suggestions.
 */
export default function AdminDashboardScreen() {
  const accent = ROLE_ACCENT.ADMIN;
  const { data: kpis, refetch: refetchKpis, isLoading } = useAdminKpis();
  const { data: disputes = [] } = useDisputes();
  const { data: appeals = [] } = useAppealedReviews();
  const { data: suggestions = [] } = useSuggestions();
  const { data: categories = [] } = useCategories();
  const updateSuggestion = useUpdateSuggestionStatus();
  const [busySuggestionId, setBusySuggestionId] = useState<string | null>(null);

  const takeRate = kpis && kpis.totalRevenue > 0
    ? ((kpis.commissionEarned / kpis.totalRevenue) * 100).toFixed(1)
    : '0';

  const openDisputes = useMemo(
    () => disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW'),
    [disputes],
  );

  const pendingSuggestions = useMemo(
    () => suggestions.filter((s) => s.status === 'PENDING' || s.status === 'CONTACTED'),
    [suggestions],
  );

  const onRefresh = () => {
    refetchKpis();
  };

  const actOnSuggestion = (s: ProviderSuggestion, status: ProviderSuggestion['status']) => {
    const verb = status === 'CONTACTED' ? 'Mark contacted' : status === 'ONBOARDED' ? 'Mark onboarded' : 'Dismiss';
    Alert.alert(verb, `${verb} — ${s.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: verb,
        onPress: () => {
          setBusySuggestionId(s.id);
          updateSuggestion.mutate(
            { id: s.id, status },
            {
              onSettled: () => setBusySuggestionId(null),
              onError: (e) => Alert.alert('Error', (e as Error).message),
            },
          );
        },
      },
    ]);
  };


  return (
    <ScreenBackground variant="admin">
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={accent.color} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <View style={styles.roleRow}>
                <Text style={[styles.roleLabel, { color: accent.color }]}>Platform Control</Text>
                <FlashingTick size={13} color={accent.color} />
              </View>
            </View>
            <LogoutButton color={COLORS.textPrimary} />
          </View>

          {/* KPI hero */}
          <View style={styles.kpiHero}>
            <View style={[styles.kpiHeroGlow, { backgroundColor: accent.glow }]} />
            <View style={styles.kpiHeroContent}>
              <Text style={styles.kpiHeroLabel}>Total Platform GMV</Text>
              <Text style={[styles.kpiHeroValue, { color: accent.color }]}>
                {formatNLe(kpis?.totalRevenue ?? 0)}
              </Text>
              <View style={styles.kpiHeroRow}>
                <View style={styles.kpiHeroStat}>
                  <Text style={styles.kpiHeroStatValue}>{takeRate}%</Text>
                  <Text style={styles.kpiHeroStatLabel}>Take Rate</Text>
                </View>
                <View style={styles.kpiHeroDivider} />
                <View style={styles.kpiHeroStat}>
                  <Text style={styles.kpiHeroStatValue}>{formatNLe(kpis?.commissionEarned ?? 0)}</Text>
                  <Text style={styles.kpiHeroStatLabel}>Commission</Text>
                </View>
                <View style={styles.kpiHeroDivider} />
                <View style={styles.kpiHeroStat}>
                  <Text style={styles.kpiHeroStatValue}>+{(kpis?.monthlyGrowth ?? 0).toFixed(1)}%</Text>
                  <Text style={styles.kpiHeroStatLabel}>Growth</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation tiles — six equal buttons */}
          <View style={styles.section}>
            <View style={styles.kpiGrid}>
              <KpiCard icon="people" label="Users" value={kpis?.totalUsers ?? 0} color={COLORS.sky} route="/admin/users" />
              <KpiCard icon="briefcase" label="Traders" value={kpis?.totalProviders ?? 0} color={accent.color} route="/admin/traders" />
              <KpiCard icon="calendar" label="Active Bookings" value={kpis?.activeBookings ?? 0} color={COLORS.amber} route="/admin/revenue" />
              <KpiCard icon="checkmark-done" label="Completed" value={kpis?.completedBookings ?? 0} color={COLORS.accent} route="/admin/reviews" />
              <KpiCard icon="star" label="Reviews" value={appeals.length + openDisputes.length} color={COLORS.violet} route="/admin/reviews" />
              <KpiCard icon="grid" label="Service Categories" value={categories.length} color={COLORS.cyan} route="/admin/catalog" />
            </View>
          </View>

          {/* Adverts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adverts</Text>
            <TouchableOpacity style={styles.sectionCard} activeOpacity={0.75} onPress={() => router.push('/admin/adverts')}>
              <View style={[styles.sectionIcon, { backgroundColor: `${COLORS.magenta}18`, borderColor: `${COLORS.magenta}30` }]}>
                <Ionicons name="images" size={22} color={COLORS.magenta} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionCardTitle}>Manage Adverts</Text>
                <Text style={styles.sectionCardDesc}>Create, edit, reorder, and toggle background media</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Provider suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provider Suggestions</Text>
            {pendingSuggestions.length > 0 ? (
              <View style={styles.suggestionList}>
                {pendingSuggestions.map((s) => (
                  <View key={s.id} style={styles.suggestionCard}>
                    <View style={styles.suggestionTop}>
                      <View style={styles.suggestionAvatar}>
                        <Ionicons name="person-add" size={16} color={accent.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionName}>{s.name}</Text>
                        <Text style={styles.suggestionMeta}>{s.phone} · {s.serviceCategory}</Text>
                      </View>
                      <View style={[styles.suggestionStatus, { backgroundColor: `${COLORS.amber}18`, borderColor: `${COLORS.amber}30` }]}>
                        <Text style={[styles.suggestionStatusText, { color: COLORS.amber }]}>{s.status}</Text>
                      </View>
                    </View>
                    {!!s.notes && <Text style={styles.suggestionNotes}>{s.notes}</Text>}
                    <View style={styles.suggestionActions}>
                      {busySuggestionId === s.id ? (
                        <ActivityIndicator color={accent.color} />
                      ) : (
                        <>
                          {s.status === 'PENDING' && (
                            <TouchableOpacity
                              style={styles.actionBtnOutline}
                              onPress={() => actOnSuggestion(s, 'CONTACTED')}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="call-outline" size={14} color={COLORS.sky} />
                              <Text style={styles.contactText}>Mark Contacted</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: accent.color, borderColor: accent.color }]}
                            onPress={() => actOnSuggestion(s, 'ONBOARDED')}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                            <Text style={styles.onboardText}>Onboard</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={26} color={COLORS.accent} />
                <Text style={styles.emptyTitle}>No pending suggestions</Text>
              </View>
            )}
          </View>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function KpiCard({ icon, label, value, color, route }: { icon: string; label: string; value: number; color: string; route: Href }) {
  return (
    <TouchableOpacity style={styles.kpiCard} activeOpacity={0.7} onPress={() => router.push(route)}>
      <View style={styles.kpiTopRow}>
        <View style={[styles.kpiIcon, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Ionicons name="chevron-forward" size={13} color={COLORS.textTertiary} />
      </View>
      <Text style={styles.kpiValue}>{value.toLocaleString()}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  roleLabel: { fontSize: 13, fontWeight: '700' },
  kpiHero: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg, ...SHADOWS.glowMagenta },
  kpiHeroGlow: { ...StyleSheet.absoluteFillObject },
  kpiHeroContent: { padding: SPACING.lg, gap: SPACING.sm, position: 'relative', zIndex: 1 },
  kpiHeroLabel: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiHeroValue: { fontSize: 38, fontWeight: '800' },
  kpiHeroRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.md },
  kpiHeroStat: { flex: 1, gap: 2 },
  kpiHeroStatValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  kpiHeroStatLabel: { fontSize: 11, color: COLORS.textTertiary },
  kpiHeroDivider: { width: 1, height: 28, backgroundColor: COLORS.divider },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  kpiCard: { width: '48%', backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md, padding: SPACING.md, gap: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  kpiTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kpiIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  kpiValue: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  kpiLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
  sectionCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  sectionIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  sectionCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  sectionCardDesc: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  suggestionList: { gap: SPACING.md },
  suggestionCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder },
  suggestionTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  suggestionAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,79,216,0.12)', borderWidth: 1, borderColor: 'rgba(255,79,216,0.20)', justifyContent: 'center', alignItems: 'center' },
  suggestionName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  suggestionMeta: { fontSize: 11, color: COLORS.textTertiary, marginTop: 1 },
  suggestionStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, borderWidth: 1 },
  suggestionStatusText: { fontSize: 10, fontWeight: '700' },
  suggestionNotes: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  suggestionActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md, gap: 5, borderWidth: 1 },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.md, gap: 5, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBgLight },
  contactText: { fontSize: 12, fontWeight: '600', color: COLORS.sky },
  onboardText: { fontSize: 12, fontWeight: '700', color: COLORS.textInverse },
  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.xs },
});
