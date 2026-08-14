import { router, Link } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { CONVERSATIONS } from '@/data/mock';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return CONVERSATIONS;
    const q = searchQuery.toLowerCase();
    return CONVERSATIONS.filter(c =>
      c.providerName.toLowerCase().includes(q) ||
      c.serviceJobName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / 3600000;
    if (diffHrs < 1) return 'now';
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h`;
    if (diffHrs < 168) return `${Math.floor(diffHrs / 24)}d`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {totalUnread > 0 && (
              <Text style={styles.headerSub}>{totalUnread} unread messages</Text>
            )}
          </View>
          <LogoutButton color={COLORS.textPrimary} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Conversations */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }} tintColor={COLORS.accent} />}
        >
          {filteredConversations.length > 0 ? (
            <View style={styles.conversationsList}>
              {filteredConversations.map(conv => (
                <Link key={conv.id} href={`/booking/${conv.bookingId}/chat`} asChild>
                  <TouchableOpacity style={styles.convCard} activeOpacity={0.7}>
                    <View style={styles.convAvatar}>
                      <Ionicons name="person" size={22} color={COLORS.textTertiary} />
                      {conv.unreadCount > 0 && <View style={styles.convOnlineDot} />}
                    </View>
                    <View style={styles.convInfo}>
                      <View style={styles.convTop}>
                        <Text style={styles.convName}>{conv.providerName}</Text>
                        <Text style={styles.convTime}>{formatTime(conv.lastMessageAt)}</Text>
                      </View>
                      <Text style={styles.convService}>{conv.serviceJobName}</Text>
                      <View style={styles.convBottom}>
                        <Text
                          style={[styles.convMessage, conv.unreadCount > 0 && styles.convMessageUnread]}
                          numberOfLines={1}
                        >
                          {conv.lastMessage}
                        </Text>
                        {conv.unreadCount > 0 && (
                          <View style={styles.convUnreadBadge}>
                            <Text style={styles.convUnreadText}>{conv.unreadCount}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={36} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No messages</Text>
              <Text style={styles.emptyDesc}>Start a booking to chat with providers</Text>
            </View>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
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
  conversationsList: {
    gap: SPACING.sm,
  },
  convCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  convOnlineDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  convInfo: { flex: 1 },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  convTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  convService: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
    marginTop: 2,
  },
  convBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  convMessage: {
    fontSize: 13,
    color: COLORS.textTertiary,
    flex: 1,
  },
  convMessageUnread: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  convUnreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  convUnreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    fontSize: 14,
    color: COLORS.textTertiary,
  },
});
