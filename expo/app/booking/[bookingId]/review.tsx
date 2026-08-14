import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useBooking, useCreateReview } from '@/hooks/use-data';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';


export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { user } = useAuth();
  const { data: booking, isLoading } = useBooking(bookingId);
  const createReview = useCreateReview();
  const [ratings, setRatings] = useState({
    timeliness: 5,
    professionalism: 5,
    quality: 5,
    communication: 5,
  });
  const [comment, setComment] = useState('');

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: COLORS.textPrimary, padding: SPACING.lg }}>
          {isLoading ? 'Loading booking…' : 'Booking not found'}
        </Text>
      </SafeAreaView>
    );
  }

  const overall = Math.round(((ratings.timeliness + ratings.professionalism + ratings.quality + ratings.communication) / 4) * 10) / 10;

  const updateRating = (key: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!user) return;
    if (!comment.trim()) {
      Alert.alert('Add a comment', 'Please share a few words about your experience.');
      return;
    }
    createReview.mutate(
      {
        bookingId: booking.id,
        customerId: user.id,
        customerName: user.name,
        customerPhoto: user.profilePhoto,
        providerId: booking.providerId,
        ratingTimeliness: ratings.timeliness,
        ratingProfessionalism: ratings.professionalism,
        ratingQuality: ratings.quality,
        ratingCommunication: ratings.communication,
        comment: comment.trim(),
      },
      {
        onSuccess: () =>
          Alert.alert(
            'Review Submitted',
            'Thank you for your feedback! Your review helps build trust in the ePaS community.',
            [{ text: 'Done', onPress: () => router.replace('/(tabs)/bookings') }],
          ),
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  };

  const criteria = [
    { key: 'timeliness' as const, label: 'Timeliness', icon: 'time-outline', desc: 'Arrived on time' },
    { key: 'professionalism' as const, label: 'Professionalism', icon: 'person-outline', desc: 'Conduct & appearance' },
    { key: 'quality' as const, label: 'Quality of Work', icon: 'checkmark-circle-outline', desc: 'Job well done' },
    { key: 'communication' as const, label: 'Communication', icon: 'chatbubble-outline', desc: 'Clear & responsive' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backBtn} color={COLORS.white} />
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <LogoutButton color={COLORS.white} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: `${booking.serviceJobColor}15` }]}>
            <Ionicons name={booking.serviceJobIcon as any} size={24} color={booking.serviceJobColor} />
          </View>
          <View>
            <Text style={styles.summaryService}>{booking.serviceJobName}</Text>
            <Text style={styles.summaryProvider}>{booking.providerName}</Text>
          </View>
        </View>

        {/* Overall rating */}
        <View style={styles.overallSection}>
          <Text style={styles.overallLabel}>Overall Rating</Text>
          <Text style={styles.overallScore}>{overall}</Text>
          <View style={styles.overallStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => {}}>
                <Ionicons
                  name={star <= Math.round(overall) ? 'star' : 'star-outline'}
                  size={32}
                  color="#F39C12"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Criteria ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Individual Criteria</Text>
          <View style={styles.criteriaCard}>
            {criteria.map((c, i) => (
              <View key={c.key}>
                <View style={styles.criteriaRow}>
                  <View style={styles.criteriaLeft}>
                    <View style={styles.criteriaIcon}>
                      <Ionicons name={c.icon as any} size={18} color={COLORS.navy} />
                    </View>
                    <View>
                      <Text style={styles.criteriaLabel}>{c.label}</Text>
                      <Text style={styles.criteriaDesc}>{c.desc}</Text>
                    </View>
                  </View>
                  <View style={styles.criteriaStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => updateRating(c.key, star)}
                      >
                        <Ionicons
                          name={star <= ratings[c.key] ? 'star' : 'star-outline'}
                          size={22}
                          color="#F39C12"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {i < criteria.length - 1 && <View style={styles.criteriaDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Comment</Text>
          <View style={styles.commentCard}>
            <TextInput
              style={styles.commentInput}
              placeholder="Share details about your experience..."
              placeholderTextColor={COLORS.textTertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, createReview.isPending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={createReview.isPending}
        >
          {createReview.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
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
  overallSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  overallLabel: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  overallStars: {
    flexDirection: 'row',
    gap: 8,
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
  criteriaCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  criteriaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  criteriaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  criteriaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  criteriaDesc: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  criteriaStars: {
    flexDirection: 'row',
    gap: 2,
  },
  criteriaDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  commentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  commentInput: {
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
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
  submitBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
