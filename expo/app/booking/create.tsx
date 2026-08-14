import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { SERVICE_AREA_NAMES } from '@/constants/areas';
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
  const [area, setArea] = useState(user?.area ?? '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ORANGE_MONEY');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prefill the area from the customer's profile once it loads.
  useEffect(() => {
    if (!area && user?.area) setArea(user.area);
  }, [area, user?.area]);

  // Service jobs no longer carry prices — only the flat platform fee is due
  // up front; the trader confirms the job price after assessing the work.
  const serviceFee = 25;
  const total = serviceFee;

  if (!job || !provider) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <BackButton style={styles.backBtn} color={COLORS.white} />
          <Text style={styles.headerTitle}>New Booking</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Booking information not found</Text>
          <Text style={styles.notFoundSubtext}>
            This provider or service may no longer be available. Go back and pick another one.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = () => {
    if (!user) return;
    if (!address.trim()) {
      setSubmitError('Please enter the service address.');
      return;
    }
    if (!area) {
      setSubmitError('Please choose the area where the service is needed.');
      return;
    }
    setSubmitError(null);
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
        area,
        scheduledDate: scheduledDate.trim() || new Date().toISOString(),
        notes: notes.trim() || undefined,
        finalPrice: Math.round(total),
        serviceFee,
        paymentMethod,
      },
      {
        // Navigate immediately — Alert.alert is a no-op on web, so gating
        // navigation on its OK button would strand the user on this screen.
        onSuccess: ({ id }) => {
          router.replace(`/booking/${id}`);
        },
        onError: (e) => setSubmitError((e as Error).message),
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

        {/* Area — mandatory; used to rank traders by distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Area</Text>
          <View style={styles.areaChips}>
            {SERVICE_AREA_NAMES.map((name) => {
              const active = area === name;
              return (
                <TouchableOpacity
                  key={name}
                  style={[styles.areaChip, active && styles.areaChipActive]}
                  onPress={() => setArea(name)}
                >
                  <Ionicons name="location" size={12} color={active ? COLORS.white : COLORS.textSecondary} />
                  <Text style={[styles.areaChipText, active && styles.areaChipTextActive]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
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

        {/* Price breakdown */}
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform fee</Text>
              <Text style={styles.priceValue}>{formatNLe(serviceFee)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total due now</Text>
              <Text style={styles.priceTotalValue}>{formatNLe(total)}</Text>
            </View>
            <Text style={styles.priceNote}>The trader confirms the job price after assessing the work.</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.bottomBar}>
        {submitError ? (
          <View style={styles.submitErrorRow}>
            <Ionicons name="alert-circle" size={14} color={COLORS.error} />
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}
        <View style={styles.bottomRow}>
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
  headerSpacer: { width: 40, height: 40 },
  notFoundWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  notFoundTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  notFoundSubtext: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
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
  areaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  areaChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  areaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  areaChipTextActive: {
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  submitErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  submitErrorText: { fontSize: 13, color: COLORS.error, flex: 1 },
  priceNote: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
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
