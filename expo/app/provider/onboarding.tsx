import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useAuth } from '@/hooks/auth-store';
import { useCategories, useProviderForUser, useUpsertProviderProfile } from '@/hooks/use-data';
import { LogoutButton } from '@/components/LogoutButton';

export default function ProviderOnboardingScreen() {
  const { user } = useAuth();
  const { data: existing } = useProviderForUser(user?.id);
  const { data: categories = [] } = useCategories();
  const upsert = useUpsertProviderProfile();
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);

  // Prefill the form when the trader already has a provider profile.
  useEffect(() => {
    if (existing) {
      setBio(existing.bio ?? '');
      setExperience(existing.experienceYears ? String(existing.experienceYears) : '');
      setSelectedCategories(existing.serviceCategoryIds ?? []);
      setServiceAreas(existing.serviceAreas.join(', '));
    }
  }, [existing]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!user) return;
    if (!bio.trim() || !experience.trim() || selectedCategories.length === 0) {
      Alert.alert('Missing Info', 'Please fill in all required fields and select at least one category.');
      return;
    }
    if (!idUploaded && !existing) {
      Alert.alert('ID Required', 'Please upload your ID document for verification.');
      return;
    }
    upsert.mutate(
      {
        existingId: existing?.id,
        userId: user.id,
        name: user.name,
        bio: bio.trim(),
        experienceYears: parseInt(experience, 10) || 0,
        serviceCategoryIds: selectedCategories,
        serviceAreas: serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          const alreadyApproved = user.approvalStatus === 'APPROVED';
          Alert.alert(
            alreadyApproved ? 'Profile Updated' : 'Profile Submitted',
            alreadyApproved
              ? 'Your trader profile has been updated.'
              : 'Your trader profile has been submitted for review. You will be notified once approved.',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (alreadyApproved) router.back();
                  else router.replace('/pending-approval');
                },
              },
            ],
          );
        },
        onError: (e) => Alert.alert('Error', (e as Error).message),
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Onboarding</Text>
        <LogoutButton color={COLORS.white} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIcon}>
            <Ionicons name="ribbon" size={24} color={COLORS.navy} />
          </View>
          <View>
            <Text style={styles.infoTitle}>Become a Verified Provider</Text>
            <Text style={styles.infoText}>Complete your profile to start receiving bookings</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Bio *</Text>
          <View style={styles.textAreaWrap}>
            <TextInput
              style={styles.textArea}
              placeholder="Tell clients about yourself, your skills and experience..."
              placeholderTextColor={COLORS.textTertiary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Experience */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Years of Experience *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={COLORS.textTertiary}
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Service categories */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Service Categories * (Select all that apply)</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(cat => {
              const selected = selectedCategories.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selected && { backgroundColor: `${cat.color}15`, borderColor: cat.color },
                  ]}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <View style={[styles.categoryChipIcon, { backgroundColor: selected ? `${cat.color}25` : `${cat.color}15` }]}>
                    <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <Text style={styles.categoryChipText}>{cat.name}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={16} color={cat.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Service areas */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Service Areas *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Freetown, Bo, Kenema"
              placeholderTextColor={COLORS.textTertiary}
              value={serviceAreas}
              onChangeText={setServiceAreas}
            />
          </View>
        </View>

        {/* ID upload */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>ID Document *</Text>
          <TouchableOpacity
            style={[styles.uploadCard, idUploaded && styles.uploadCardDone]}
            onPress={() => setIdUploaded(true)}
          >
            {idUploaded ? (
              <>
                <View style={styles.uploadIconDone}>
                  <Ionicons name="checkmark" size={24} color={COLORS.green} />
                </View>
                <View>
                  <Text style={styles.uploadTitleDone}>ID Uploaded</Text>
                  <Text style={styles.uploadSubDone}>National ID / Passport / Driver's License</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Ionicons name="cloud-upload-outline" size={24} color={COLORS.navy} />
                </View>
                <View>
                  <Text style={styles.uploadTitle}>Upload ID Document</Text>
                  <Text style={styles.uploadSub}>National ID / Passport / Driver's License</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, upsert.isPending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={upsert.isPending}
        >
          {upsert.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>{existing ? 'Save Changes' : 'Submit for Review'}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  field: {
    marginTop: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
    minHeight: 90,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  uploadCardDone: {
    borderColor: COLORS.green,
    borderStyle: 'solid',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconDone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.green}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  uploadSub: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  uploadTitleDone: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.green,
  },
  uploadSubDone: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
