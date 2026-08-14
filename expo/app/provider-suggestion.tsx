import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { CATEGORIES, PROVIDER_SUGGESTIONS } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';

const STATUS_CONFIG = {
  PENDING: { color: COLORS.warning, label: 'Pending' },
  CONTACTED: { color: COLORS.info, label: 'Contacted' },
  ONBOARDED: { color: COLORS.green, label: 'Onboarded' },
  DECLINED: { color: COLORS.error, label: 'Declined' },
};

export default function ProviderSuggestionScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState(PROVIDER_SUGGESTIONS);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing Info', 'Please enter at least a name and phone number.');
      return;
    }
    Alert.alert(
      'Suggestion Submitted',
      'Thank you for recommending a provider! Our team will review and reach out to them.',
      [{ text: 'OK', onPress: () => {
        setSuggestions(prev => [{
          id: `ps_${Date.now()}`,
          name,
          phone,
          serviceCategory: category || 'General',
          notes,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setName('');
        setPhone('');
        setCategory('');
        setNotes('');
      }}]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suggest a Provider</Text>
        <LogoutButton color={COLORS.textPrimary} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="people-outline" size={28} color={COLORS.navy} />
          </View>
          <Text style={styles.introTitle}>Know a great service provider?</Text>
          <Text style={styles.introText}>
            Help grow the ePaS community by recommending trusted providers in your area. Our team will reach out to onboard them.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Provider Name *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={COLORS.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={COLORS.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={COLORS.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="+232 ..."
                placeholderTextColor={COLORS.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Service Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    category === cat.name && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Ionicons name={cat.icon as any} size={14} color={category === cat.name ? COLORS.white : cat.color} />
                  <Text style={[styles.categoryChipText, category === cat.name && styles.categoryChipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                placeholder="Why do you recommend this provider?"
                placeholderTextColor={COLORS.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="send" size={18} color={COLORS.white} />
            <Text style={styles.submitBtnText}>Submit Suggestion</Text>
          </TouchableOpacity>
        </View>

        {/* Previous suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Your Suggestions</Text>
            <View style={styles.historyList}>
              {suggestions.map(sugg => {
                const config = STATUS_CONFIG[sugg.status];
                return (
                  <View key={sugg.id} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyIcon}>
                        <Ionicons name="person-outline" size={18} color={COLORS.navy} />
                      </View>
                      <View>
                        <Text style={styles.historyName}>{sugg.name}</Text>
                        <Text style={styles.historyPhone}>{sugg.phone}</Text>
                        <Text style={styles.historyCategory}>{sugg.serviceCategory}</Text>
                      </View>
                    </View>
                    <View style={[styles.historyStatus, { backgroundColor: `${config.color}15` }]}>
                      <Text style={[styles.historyStatusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  field: {},
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
  categoryRow: {
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  categoryChipActive: {
    backgroundColor: COLORS.navy,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    marginTop: SPACING.sm,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  historySection: {
    marginTop: SPACING.xl,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  historyList: {
    gap: SPACING.sm,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyPhone: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  historyCategory: {
    fontSize: 12,
    color: COLORS.navy,
    marginTop: 2,
  },
  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
