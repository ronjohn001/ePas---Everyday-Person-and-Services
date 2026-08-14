import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';

interface TermsSection {
  id: string;
  title: string;
  body: string;
}

const SECTIONS: TermsSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: 'By downloading, accessing, or using ePaS ("the Service"), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use the Service.',
  },
  {
    id: 'accounts',
    title: '2. User Accounts',
    body: 'You must register with a valid email address or mobile phone number and choose a role (Customer, Trader, or Admin). A phone number is required for all accounts. You are responsible for keeping your credentials secure and for all activity under your account. Biometric authentication may be enabled on supported devices for faster, secure access.',
  },
  {
    id: 'roles',
    title: '3. User Roles',
    body: 'Customers may browse services, book traders, leave reviews, and earn loyalty points. Traders may list services, accept bookings, manage their schedule, and receive payouts. Admins may moderate the platform, manage catalog content, resolve disputes, and oversee users. Each role grants different functionality within the app.',
  },
  {
    id: 'bookings',
    title: '4. Bookings & Payments',
    body: 'Bookings made through ePaS are subject to trader availability and acceptance. Payments are processed securely through the platform. Traders receive payouts net of any applicable platform commission. Cancellation and refund eligibility depend on the timing and status of the booking.',
  },
  {
    id: 'reviews',
    title: '5. Reviews & Conduct',
    body: 'Users agree to provide honest, accurate reviews and ratings. Abuse, harassment, fraudulent behaviour, or attempts to manipulate ratings may result in suspension or removal from the platform.',
  },
  {
    id: 'disputes',
    title: '6. Disputes',
    body: 'If a dispute arises between a Customer and a Trader, ePaS provides an in-app dispute process. Our Admin team will review evidence (messages, photos, payment records) and may issue refunds, release escrowed funds, or take corrective action at our discretion.',
  },
  {
    id: 'liability',
    title: '7. Limitation of Liability',
    body: 'ePaS acts as a marketplace connecting Customers and Traders. We are not liable for the acts or omissions of Traders, nor for any loss arising from services performed off-platform. The Service is provided "as is" without warranties of any kind.',
  },
  {
    id: 'privacy',
    title: '8. Privacy',
    body: 'Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal data, including authentication credentials, location, and transaction history.',
  },
  {
    id: 'changes',
    title: '9. Changes to Terms',
    body: 'We may update these Terms & Conditions from time to time. Continued use of the Service after changes are posted constitutes acceptance of the revised terms. Material changes will be highlighted in-app.',
  },
  {
    id: 'contact',
    title: '10. Contact',
    body: 'If you have questions about these Terms & Conditions, please contact ePaS support through the app or via the support email listed on your Profile screen.',
  },
];

export default function TermsScreen() {
  const lastUpdated = '21 July 2026';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton style={styles.backBtn} />
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <LogoutButton color={COLORS.textPrimary} />
      </View>

      <ScreenBackground variant="default">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.introCard}>
            <View style={styles.introIconWrap}>
              <Ionicons name="document-text" size={26} color={COLORS.accent} />
            </View>
            <Text style={styles.introTitle}>ePaS Terms & Conditions</Text>
            <Text style={styles.introSub}>Last updated: {lastUpdated}</Text>
            <Text style={styles.introBody}>
              Please read these terms carefully before using ePaS. They govern your use of the
              app regardless of whether you are a Customer, Trader, or Admin.
            </Text>
          </View>

          {SECTIONS.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}

          <View style={styles.footnote}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.footnoteText}>
              This document is provided for informational purposes within the ePaS demo app.
            </Text>
          </View>
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryDark,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  introCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  introIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.glassBgStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  introSub: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  introBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xs,
  },
  footnoteText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textTertiary,
    lineHeight: 15,
  },
});
