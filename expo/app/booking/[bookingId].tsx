import { useLocalSearchParams, router } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, ROLE_ACCENT } from '@/constants/colors';
import { formatNLe } from '@/data/mock';
import { useAuth } from '@/hooks/auth-store';
import { useBooking, useUpdateBookingStatus } from '@/hooks/use-data';
import { StatusBadge } from '@/components/StatusBadge';
import { LogoutButton } from '@/components/LogoutButton';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { Message, BookingStatus } from '@/types';

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { role } = useAuth();
  const accent = role ? ROLE_ACCENT[role].color : COLORS.clientAccent;
  const { data: booking } = useBooking(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !booking) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      bookingId: booking.id,
      senderId: 'user_me',
      senderName: 'You',
      senderRole: 'CUSTOMER',
      text: inputText.trim(),
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  }, [inputText, booking]);

  if (!booking) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Text style={{ color: COLORS.textPrimary, padding: SPACING.lg }}>Loading booking…</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const timeline = [
    { status: 'REQUESTED', label: 'Booking Requested', icon: 'document-text' },
    { status: 'ACCEPTED', label: 'Provider Accepted', icon: 'checkmark-circle' },
    { status: 'EN_ROUTE', label: 'Provider En Route', icon: 'car' },
    { status: 'IN_PROGRESS', label: 'Service In Progress', icon: 'hammer' },
    { status: 'COMPLETED', label: 'Service Completed', icon: 'checkmark-done' },
  ];

  const currentStatusIndex = timeline.findIndex(t => t.status === booking.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <LogoutButton color={COLORS.white} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Service summary */}
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: `${booking.serviceJobColor}15` }]}>
              <Ionicons name={booking.serviceJobIcon as any} size={24} color={booking.serviceJobColor} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryService}>{booking.serviceJobName}</Text>
              <Text style={styles.summaryProvider}>{booking.providerName}</Text>
            </View>
            <StatusBadge status={booking.status} />
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Timeline</Text>
            <View style={styles.timeline}>
              {timeline.map((step, i) => {
                const isDone = i < currentStatusIndex || currentStatusIndex === timeline.length - 1;
                const isCurrent = i === currentStatusIndex && booking.status !== 'COMPLETED';
                return (
                  <View key={step.status} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isCurrent && styles.timelineDotCurrent,
                      ]}>
                        <Ionicons name={step.icon as any} size={14} color={isDone || isCurrent ? COLORS.white : COLORS.textTertiary} />
                      </View>
                      {i < timeline.length - 1 && (
                        <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[
                        styles.timelineLabel,
                        (isDone || isCurrent) && styles.timelineLabelActive,
                      ]}>
                        {step.label}
                      </Text>
                      {isCurrent && <Text style={styles.timelineCurrent}>In progress</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color={COLORS.textTertiary} />
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{booking.address}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.textTertiary} />
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(booking.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={18} color={COLORS.textTertiary} />
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>
                  {booking.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Africell Money'}
                </Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Ionicons name="cube-outline" size={18} color={COLORS.textTertiary} />
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {booking.bookingType === 'INSTANT' ? 'Instant Booking' : 'In-Person Quote'}
                </Text>
              </View>
            </View>
          </View>

          {/* Price breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            <View style={styles.detailsCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service fee</Text>
                <Text style={styles.priceValue}>{formatNLe(booking.finalPrice)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Platform commission (15%)</Text>
                <Text style={styles.priceValue}>{formatNLe(booking.platformCommission)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Processing fee</Text>
                <Text style={styles.priceValue}>{formatNLe(booking.serviceFee)}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceTotalLabel}>Total Paid</Text>
                <Text style={styles.priceTotalValue}>{formatNLe(booking.finalPrice)}</Text>
              </View>
              <View style={styles.paymentStatusRow}>
                <View style={[styles.paymentStatusDot, { backgroundColor: booking.paymentStatus === 'RELEASED' ? COLORS.green : COLORS.warning }]} />
                <Text style={styles.paymentStatusText}>
                  {booking.paymentStatus === 'RELEASED'
                    ? 'Payment released to provider'
                    : booking.paymentStatus === 'HELD_IN_ESCROW'
                    ? 'Payment held in escrow'
                    : 'Payment pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Chat preview */}
          <View style={styles.section}>
            <View style={styles.chatHeader}>
              <Text style={styles.sectionTitle}>Messages</Text>
              <TouchableOpacity style={styles.chatOpenBtn} onPress={() => router.push(`/booking/${booking.id}/chat`)}>
                <Text style={styles.chatOpenText}>Open Chat</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.navy} />
              </TouchableOpacity>
            </View>
            <View style={styles.chatPreviewCard}>
              {messages.slice(-3).map(msg => (
                <View key={msg.id} style={[styles.chatBubble, msg.senderRole === 'CUSTOMER' ? styles.chatBubbleMe : styles.chatBubbleThem]}>
                  <Text style={styles.chatBubbleText}>{msg.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          {booking.status === 'COMPLETED' && !booking.hasReview && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => router.push(`/booking/${booking.id}/review`)}
              >
                <Ionicons name="star" size={20} color={COLORS.white} />
                <Text style={styles.reviewBtnText}>Leave a Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {(booking.status === 'REQUESTED' || booking.status === 'ACCEPTED') && (
            <View style={styles.section}>
              <TouchableOpacity style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryInfo: { flex: 1 },
  summaryService: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryProvider: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  timeline: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotDone: {
    backgroundColor: COLORS.green,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.navy,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.divider,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineLineDone: {
    backgroundColor: COLORS.green,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  timelineLabel: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  timelineLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  timelineCurrent: {
    fontSize: 12,
    color: COLORS.navy,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textTertiary,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  paymentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  chatOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chatOpenText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },
  chatPreviewCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  chatBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.navy,
  },
  chatBubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.divider,
  },
  chatBubbleText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
  },
  reviewBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
});
