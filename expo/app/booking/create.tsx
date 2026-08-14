import { useLocalSearchParams, router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { formatNLe } from '@/data/mock';
import { useAuth } from '@/hooks/auth-store';
import { useJob, useProvider, useCreateBooking } from '@/hooks/use-data';
import type { BookingType, PaymentMethod } from '@/types';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';

export default function CreateBookingScreen() {
  const { jobId, providerId } = useLocalSearchParams<{ jobId: string; providerId: string }>();
  const { user } = useAuth();
  const { data: job } = useJob(jobId);
  const { data: provider } = useProvider(providerId);
  const createBooking = useCreateBooking();

  const [bookingType, setBookingType] = useState<BookingType>('INSTANT');
  const [address, setAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ORANGE_MONEY');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  const basePrice = job?.basePrice ?? 0;
  const assessmentFee = job?.assessmentFee ?? 0;
  const loyaltyDiscount = useLoyaltyPoints ? Math.min(100, basePrice * 0.1) : 0;
  const serviceFee = 25;
  const total = basePrice + assessmentFee + serviceFee - loyaltyDiscount;

  if (!job || !provider) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Booking information not found</Text>
      </SafeAreaView>
    );
  }

  const handleConfirm = () => {
    if (!user) return;
    if (!address.trim()) {
      Alert.alert('Missing Address', 'Please enter the service address.');
      return;
    }
    createBooking.mutate(
      {
        customerId: user.id,
        customerName: user.name,
        customerPhoto: user.profilePhoto,
        providerId: provider.id,
        providerName: provider.name,
        providerPhoto: provider.profilePhoto,
        serviceJobId: job.id,
        serviceJobName: job.name,
        serviceJobIcon: job.icon,
        serviceJobColor: job.color,
        bookingType,
        address: address.trim(),
        scheduledDate: scheduledDate.trim() || new Date().toISOString(),
        notes: notes.trim() || undefined,
        finalPrice: Math.round(total),
        serviceFee,
        paymentMethod,
      },
      {
        onSuccess: ({ id }) => {
          Alert.alert(
            'Booking Confirmed',
            `Your booking for ${job.name} has been created. ${provider.name} will be notified.`,
            [{ text: 'OK', onPress: () => router.replace(`/booking/${id}`) }],
          );
        },
        onError: (e) => Alert.alert('Booking failed', (e as Error).message),
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backBtn} color={COLORS.white} />
        <Text style={styles.headerTitle}>New Booking</Text>
        <LogoutButton color={COLORS.white} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service summary */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: `${job.color}15` }]}>
            <Ionicons name={job.icon as any} size={24} color={job.color} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryJob}>{job.name}</Text>
            <Text style={styles.summaryProvider}>{provider.name}</Text>
          </View>
          <Text style={styles.summaryPrice}>{formatNLe(basePrice)}</Text>
        </View>

        {/* Booking type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.bookingTypes}>
            <TouchableOpacity
              style={[styles.bookingTypeCard, bookingType === 'INSTANT' && styles.bookingTypeActive]}
              onPress={() => setBookingType('INSTANT')}
            >
              <Ionicons name="flash" size={22} color={bookingType === 'INSTANT' ? COLORS.navy : COLORS.textTertiary} />
              <Text style={[styles.bookingTypeTitle, bookingType === 'INSTANT' && styles.bookingTypeTitleActive]}>Instant</Text>
              <Text style={styles.bookingTypeDesc}>Provider comes right away</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookingTypeCard, bookingType === 'IN_PERSON_QUOTE' && styles.bookingTypeActive]}
              onPress={() => setBookingType('IN_PERSON_QUOTE')}
            >
              <Ionicons name="document-text" size={22} color={bookingType === 'IN_PERSON_QUOTE' ? COLORS.navy : COLORS.textTertiary} />
              <Text style={[styles.bookingTypeTitle, bookingType === 'IN_PERSON_QUOTE' && styles.bookingTypeTitleActive]}>Get Quote</Text>
              <Text style={styles.bookingTypeDesc}>In-person assessment first</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Enter full address"
              placeholderTextColor={COLORS.textTertiary}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Tomorrow 10:00 AM"
              placeholderTextColor={COLORS.textTertiary}
              value={scheduledDate}
              onChangeText={setScheduledDate}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <View style={styles.textAreaWrap}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what you need done..."
              placeholderTextColor={COLORS.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'ORANGE_MONEY' && styles.paymentActive]}
            onPress={() => setPaymentMethod('ORANGE_MONEY')}
          >
            <View style={[styles.paymentIcon, { backgroundColor: COLORS.orangeMoney }]}>
              <Ionicons name="cash" size={20} color={COLORS.white} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Orange Money</Text>
              <Text style={styles.paymentDesc}>Pay via Orange Money wallet</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'ORANGE_MONEY' && styles.radioActive]}>
              {paymentMethod === 'ORANGE_MONEY' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'AFRICELL_MONEY' && styles.paymentActive]}
            onPress={() => setPaymentMethod('AFRICELL_MONEY')}
          >
            <View style={[styles.paymentIcon, { backgroundColor: COLORS.africellMoney }]}>
              <Ionicons name="cash" size={20} color={COLORS.white} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Africell Money</Text>
              <Text style={styles.paymentDesc}>Pay via Africell Money wallet</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'AFRICELL_MONEY' && styles.radioActive]}>
              {paymentMethod === 'AFRICELL_MONEY' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Loyalty discount */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.loyaltyRow}
            onPress={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
          >
            <View style={styles.loyaltyLeft}>
              <View style={styles.loyaltyIcon}>
                <Ionicons name="gift-outline" size={18} color={COLORS.green} />
              </View>
              <View>
                <Text style={styles.loyaltyTitle}>Use loyalty points</Text>
                <Text style={styles.loyaltyDesc}>Save {formatNLe(loyaltyDiscount)} with 100 points</Text>
              </View>
            </View>
            <View style={[styles.toggle, useLoyaltyPoints && styles.toggleActive]}>
              <View style={[styles.toggleDot, useLoyaltyPoints && styles.toggleDotActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Price breakdown */}
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>{formatNLe(basePrice)}</Text>
            </View>
            {assessmentFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Assessment fee</Text>
                <Text style={styles.priceValue}>{formatNLe(assessmentFee)}</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform fee</Text>
              <Text style={styles.priceValue}>{formatNLe(serviceFee)}</Text>
            </View>
            {loyaltyDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: COLORS.green }]}>Loyalty discount</Text>
                <Text style={[styles.priceValue, { color: COLORS.green }]}>-{formatNLe(loyaltyDiscount)}</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>{formatNLe(total)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Total</Text>
          <Text style={styles.bottomPriceValue}>{formatNLe(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, createBooking.isPending && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={createBooking.isPending}
        >
          {createBooking.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
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
  summaryJob: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryProvider: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
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
  bookingTypes: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  bookingTypeCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bookingTypeActive: {
    borderColor: COLORS.navy,
    backgroundColor: `${COLORS.navy}08`,
  },
  bookingTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bookingTypeTitleActive: {
    color: COLORS.navy,
  },
  bookingTypeDesc: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textAreaWrap: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  textArea: {
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 70,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentActive: {
    borderColor: COLORS.navy,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  paymentDesc: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.navy,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.navy,
  },
  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  loyaltyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loyaltyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.green}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  loyaltyDesc: {
    fontSize: 12,
    color: COLORS.green,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.green,
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  priceSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  priceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  bottomPrice: {},
  bottomPriceLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
