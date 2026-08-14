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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { useAllUsers, useSetUserApproval, type AdminUserRow } from '@/hooks/use-data';
import { ROLE_LABELS, type ApprovalStatus } from '@/types';

/** Manage Users — pending account approvals + all-user search with suspend/reinstate. */
export default function AdminUsersScreen() {
  const accent = ROLE_ACCENT.ADMIN;
  const { data: users = [], refetch, isLoading } = useAllUsers();
  const setApproval = useSetUserApproval();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingUsers = useMemo(() => users.filter((u) => u.approvalStatus === 'PENDING'), [users]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q),
    );
  }, [users, query]);

  const act = (u: AdminUserRow, status: ApprovalStatus) => {
    const verb = status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? 'Reject' : 'Suspend';
    Alert.alert(`${verb} ${u.name}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: verb,
        style: status === 'APPROVED' ? 'default' : 'destructive',
        onPress: () => {
          setBusyId(u.id);
          setApproval.mutate(
            { userId: u.id, status },
            {
              onSettled: () => setBusyId(null),
              onError: (e) => Alert.alert('Error', (e as Error).message),
            },
          );
        },
      },
    ]);
  };

  const statusColor = (s: ApprovalStatus) =>
    s === 'APPROVED' ? COLORS.accent : s === 'PENDING' ? COLORS.amber : COLORS.error;

  return (
    <ScreenBackground variant="admin">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Users</Text>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={accent.color} />}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pending approvals */}
          {pendingUsers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Approvals</Text>
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{pendingUsers.length}</Text>
                </View>
              </View>
              <View style={styles.list}>
                {pendingUsers.map((u) => (
                  <View key={u.id} style={styles.userCard}>
                    <View style={styles.userTop}>
                      <View style={styles.userAvatar}>
                        <Ionicons name="person" size={16} color={COLORS.textTertiary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{u.name}</Text>
                        <Text style={styles.userMeta}>{ROLE_LABELS[u.role]} · {u.email || u.phone}</Text>
                      </View>
                    </View>
                    <View style={styles.actionRow}>
                      {busyId === u.id ? (
                        <ActivityIndicator color={accent.color} />
                      ) : (
                        <>
                          <TouchableOpacity style={styles.rejectBtn} onPress={() => act(u, 'REJECTED')} activeOpacity={0.7}>
                            <Ionicons name="close" size={15} color={COLORS.error} />
                            <Text style={styles.rejectText}>Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.approveBtn} onPress={() => act(u, 'APPROVED')} activeOpacity={0.7}>
                            <Ionicons name="checkmark" size={15} color={COLORS.textInverse} />
                            <Text style={styles.approveText}>Approve</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* All users */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Users</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={COLORS.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email or phone..."
                placeholderTextColor={COLORS.textTertiary}
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.list}>
              {filtered.map((u) => (
                <View key={u.id} style={styles.userRow}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={15} color={COLORS.textTertiary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
                      <View style={[styles.statusDot, { backgroundColor: statusColor(u.approvalStatus) }]} />
                    </View>
                    <Text style={styles.userMeta} numberOfLines={1}>
                      {ROLE_LABELS[u.role]} · {u.approvalStatus} · {u.email || u.phone}
                    </Text>
                  </View>
                  {busyId === u.id ? (
                    <ActivityIndicator color={accent.color} size="small" />
                  ) : u.role !== 'ADMIN' ? (
                    u.approvalStatus === 'SUSPENDED' ? (
                      <TouchableOpacity style={styles.reinstateBtn} onPress={() => act(u, 'APPROVED')} activeOpacity={0.7}>
                        <Ionicons name="refresh" size={13} color={COLORS.accent} />
                        <Text style={styles.reinstateText}>Reinstate</Text>
                      </TouchableOpacity>
                    ) : u.approvalStatus === 'APPROVED' ? (
                      <TouchableOpacity style={styles.suspendBtn} onPress={() => act(u, 'SUSPENDED')} activeOpacity={0.7}>
                        <Ionicons name="ban-outline" size={13} color={COLORS.error} />
                        <Text style={styles.suspendText}>Suspend</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.reinstateBtn} onPress={() => act(u, 'APPROVED')} activeOpacity={0.7}>
                        <Ionicons name="checkmark" size={13} color={COLORS.accent} />
                        <Text style={styles.reinstateText}>Approve</Text>
                      </TouchableOpacity>
                    )
                  ) : null}
                </View>
              ))}
              {filtered.length === 0 && (
                <View style={styles.emptyCard}>
                  <Ionicons name="people-outline" size={28} color={COLORS.textTertiary} />
                  <Text style={styles.emptyTitle}>No users found</Text>
                </View>
              )}
            </View>
          </View>

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
  listContent: { paddingHorizontal: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  countPill: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,184,64,0.15)', borderWidth: 1, borderColor: 'rgba(255,184,64,0.30)' },
  countPillText: { fontSize: 11, fontWeight: '800', color: COLORS.amber },
  list: { gap: SPACING.sm },
  userCard: { backgroundColor: COLORS.glassBg, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  userTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.glassBg, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder },
  userAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.glassBorder, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flexShrink: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  userMeta: { fontSize: 11, color: COLORS.textTertiary, marginTop: 1 },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, minHeight: 38, alignItems: 'center' },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: 'rgba(255,92,122,0.08)', borderRadius: RADIUS.md, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,92,122,0.30)' },
  rejectText: { fontSize: 12, fontWeight: '700', color: COLORS.error },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: 10 },
  approveText: { fontSize: 12, fontWeight: '700', color: COLORS.textInverse },
  suspendBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.pill, backgroundColor: 'rgba(255,92,122,0.08)', borderWidth: 1, borderColor: 'rgba(255,92,122,0.30)' },
  suspendText: { fontSize: 12, fontWeight: '700', color: COLORS.error },
  reinstateBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.pill, backgroundColor: 'rgba(0,255,163,0.08)', borderWidth: 1, borderColor: 'rgba(0,255,163,0.30)' },
  reinstateText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 2, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder, marginBottom: SPACING.md },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary },
  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textTertiary },
});
