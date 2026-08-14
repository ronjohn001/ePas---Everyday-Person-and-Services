import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/hooks/auth-store';
import {
  useNotifications,
  useAllNotifications,
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-data';
import type { AppNotification } from '@/types';

const TYPE_CONFIG: Record<AppNotification['type'], { icon: string; color: string }> = {
  BOOKING: { icon: 'calendar', color: COLORS.cyan },
  MESSAGE: { icon: 'chatbubble', color: COLORS.sky },
  REVIEW: { icon: 'star', color: COLORS.amber },
  PAYMENT: { icon: 'cash', color: COLORS.accent },
  SYSTEM: { icon: 'information-circle', color: COLORS.violet },
};

const NOTIF_TYPES: AppNotification['type'][] = ['SYSTEM', 'BOOKING', 'MESSAGE', 'REVIEW', 'PAYMENT'];

function formatTime(iso: string): string {
  const date = new Date(iso);
  const diffHrs = (Date.now() - date.getTime()) / 3600000;
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [scope, setScope] = useState<'mine' | 'all'>('mine');

  const mineQuery = useNotifications(user?.id);
  const allQuery = useAllNotifications(isAdmin && scope === 'all');
  const notifications = scope === 'all' ? (allQuery.data ?? []) : (mineQuery.data ?? []);

  const createMut = useCreateNotification();
  const updateMut = useUpdateNotification();
  const deleteMut = useDeleteNotification();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [refreshing, setRefreshing] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<AppNotification | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<AppNotification['type']>('SYSTEM');
  const [formError, setFormError] = useState<string | null>(null);

  const saving = createMut.isPending || updateMut.isPending;
  const unreadCount = scope === 'mine' ? notifications.filter((n) => !n.isRead).length : 0;

  const onRefresh = () => {
    setRefreshing(true);
    const q = scope === 'all' ? allQuery : mineQuery;
    q.refetch().finally(() => setRefreshing(false));
  };

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setBody('');
    setType('SYSTEM');
    setFormError(null);
    setEditorVisible(true);
  };

  const openEdit = (n: AppNotification) => {
    setEditing(n);
    setTitle(n.title);
    setBody(n.body);
    setType(n.type);
    setFormError(null);
    setEditorVisible(true);
  };

  const handlePress = (n: AppNotification) => {
    if (scope === 'mine' && !n.isRead) markRead.mutate(n.id);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setFormError('Please enter a title.');
      return;
    }
    if (editing) {
      updateMut.mutate(
        { id: editing.id, title: title.trim(), body: body.trim(), type },
        {
          onSuccess: () => setEditorVisible(false),
          onError: () => setFormError('Could not save changes. Please try again.'),
        }
      );
    } else if (user?.id) {
      createMut.mutate(
        { userId: user.id, title: title.trim(), body: body.trim(), type, createdBy: user.id },
        {
          onSuccess: () => setEditorVisible(false),
          onError: () => setFormError('Could not create the notification. Please try again.'),
        }
      );
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    deleteMut.mutate(editing.id, {
      onSuccess: () => setEditorVisible(false),
      onError: () => setFormError('Could not delete this notification. Please try again.'),
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header — back always works, plus quick actions */}
        <View style={styles.header}>
          <BackButton style={styles.iconBtn} size={20} />
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={() => user?.id && markAllRead.mutate(user.id)} activeOpacity={0.7}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color={COLORS.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin scope toggle — admins can see and manage everyone's notifications */}
        {isAdmin && (
          <View style={styles.scopeRow}>
            {(['mine', 'all'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.scopeChip, scope === s && styles.scopeChipActive]}
                onPress={() => setScope(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.scopeChipText, scope === s && styles.scopeChipTextActive]}>
                  {s === 'mine' ? 'Mine' : 'All users'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {notifications.length > 0 ? (
            <View style={styles.notifList}>
              {notifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.SYSTEM;
                const manageable = isAdmin || notif.createdBy === user?.id;
                const showUnread = scope === 'mine' && !notif.isRead;
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[styles.notifCard, showUnread && styles.notifCardUnread]}
                    onPress={() => handlePress(notif)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: `${config.color}18`, borderColor: `${config.color}35` }]}>
                      <Ionicons name={config.icon as any} size={18} color={config.color} />
                    </View>
                    <View style={styles.notifInfo}>
                      <View style={styles.notifHeader}>
                        <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                        {showUnread && <View style={styles.unreadDot} />}
                      </View>
                      {!!notif.body && <Text style={styles.notifBody}>{notif.body}</Text>}
                      <View style={styles.notifMetaRow}>
                        <Text style={styles.notifTime}>{formatTime(notif.createdAt)}</Text>
                        {notif.createdBy === user?.id && (
                          <View style={styles.ownChip}>
                            <Text style={styles.ownChipText}>Added by you</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {manageable && (
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(notif)} hitSlop={8} activeOpacity={0.7}>
                        <Ionicons name="create-outline" size={17} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={36} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyDesc}>You're all caught up! Tap + to add one.</Text>
            </View>
          )}
        </ScrollView>

        {/* Create / edit modal — Save and Delete live here so no system alerts are needed */}
        <Modal visible={editorVisible} transparent animationType="fade" onRequestClose={() => setEditorVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editing ? 'Edit notification' : 'New notification'}</Text>
              {!editing && <Text style={styles.modalHint}>Posted to your own notifications feed.</Text>}

              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Team maintenance on Friday"
                placeholderTextColor={COLORS.textTertiary}
              />

              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                value={body}
                onChangeText={setBody}
                placeholder="Add details..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.typeRow}>
                {NOTIF_TYPES.map((t) => {
                  const c = TYPE_CONFIG[t];
                  const active = type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, active && { borderColor: c.color, backgroundColor: `${c.color}18` }]}
                      onPress={() => setType(t)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={c.icon as any} size={13} color={active ? c.color : COLORS.textTertiary} />
                      <Text style={[styles.typeChipText, active && { color: c.color }]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {formError && <Text style={styles.errorText}>{formError}</Text>}

              <View style={styles.modalActions}>
                {editing && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleteMut.isPending} activeOpacity={0.8}>
                    {deleteMut.isPending ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditorVisible(false)} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.textInverse} />
                  ) : (
                    <Text style={styles.saveBtnText}>{editing ? 'Save changes' : 'Add'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
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
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  scopeChipActive: {
    backgroundColor: 'rgba(0,255,163,0.12)',
    borderColor: 'rgba(0,255,163,0.35)',
  },
  scopeChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  scopeChipTextActive: {
    color: COLORS.accent,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  notifList: {
    gap: SPACING.sm,
    paddingTop: SPACING.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(0,255,163,0.06)',
    borderColor: 'rgba(0,255,163,0.22)',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  notifInfo: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  notifBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  notifMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 6,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  ownChip: {
    backgroundColor: 'rgba(34,229,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(34,229,255,0.25)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  ownChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,10,22,0.75)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalHint: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 3,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  inputMulti: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
  },
  errorText: {
    fontSize: 12.5,
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,92,122,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,122,0.25)',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.error,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 92,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
