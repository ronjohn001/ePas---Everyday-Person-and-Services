import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { LogoutButton } from '@/components/LogoutButton';
import { BackButton } from '@/components/BackButton';

interface PrivacySection {
  id: string;
  title: string;
  body: string;
}

const SECTIONS: PrivacySection[] = [
  {
    id: 'overview',
    title: '1. Overview',
    body: 'This Privacy Policy explains how ePaS ("we", "us") collects, uses, discloses, and safeguards your information when you use our mobile app and services. We are committed to protecting your privacy and complying with applicable data protection laws.',
  },
  {
    id: 'data-we-collect',
    title: '2. Information We Collect',
    body: 'Account data: your name, email address, mobile phone number(s), role (Customer, Trader, or Admin), profile photo, and optional address. Authentication data: hashed passwords and, if enabled, biometric credentials stored locally on your device. Usage data: booking history, messages, reviews, transactions, and loyalty activity. Device data: device identifiers, approximate location (with consent), and crash/usage analytics.',
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    body: 'To create and manage your account, authenticate your identity, process bookings and payments, facilitate messaging between Customers and Traders, display reviews and ratings, calculate trader earnings and payouts, prevent fraud and abuse, comply with legal obligations, and provide customer support.',
  },
  {
    id: 'legal-basis',
    title: '4. Legal Basis for Processing',
    body: 'Where required (e.g. under GDPR), we process your data based on: performance of the contract (providing the service you requested), your consent (e.g. location, biometrics, marketing), our legitimate interests (platform security, fraud prevention), and compliance with legal obligations.',
  },
  {
    id: 'sharing',
    title: '5. Sharing & Disclosure',
    body: 'We share limited information between Customers and Traders as needed to fulfil bookings (e.g. name, contact details, service address). We do not sell your personal data. We may share data with payment processors, cloud infrastructure providers, and authorities where legally required.',
  },
  {
    id: 'storage',
    title: '6. Data Storage & Security',
    body: 'Your data is stored on secure cloud infrastructure (Supabase / Postgres) with encryption in transit (TLS) and at rest. Passwords are hashed by the authentication provider. Biometric data never leaves your device. Access is restricted by Row Level Security so each user can only access their own data.',
  },
  {
    id: 'retention',
    title: '7. Retention',
    body: 'We retain account and transaction data for as long as your account is active and as needed to provide services, comply with legal/accounting requirements, and resolve disputes. You may request deletion of your account at any time; certain records may be kept to meet legal obligations.',
  },
  {
    id: 'your-rights',
    title: '8. Your Rights',
    body: 'Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data, withdraw consent, and object to certain processing. To exercise these rights, contact ePaS support through the app or via the support email listed on your Profile screen.',
  },
  {
    id: 'children',
    title: '9. Children\u2019s Privacy',
    body: 'ePaS is not intended for users under 16 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a minor, please contact us and we will promptly delete it.',
  },
  {
    id: 'international',
    title: '10. International Transfers',
    body: 'Your data may be processed in countries other than your own. Where this occurs, we rely on appropriate safeguards such as standard contractual clauses to ensure a comparable level of protection for your personal data.',
  },
  {
    id: 'cookies',
    title: '11. Cookies & Similar Technologies',
    body: 'The ePaS mobile app does not use browser cookies. We may use local device storage and analytics SDKs to remember preferences, keep you signed in securely, and measure app performance. You can disable analytics in your Profile settings.',
  },
  {
    id: 'changes',
    title: '12. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Material changes will be highlighted in-app or communicated before they take effect. Continued use of the Service after changes are posted constitutes acceptance of the revised policy.',
  },
  {
    id: 'contact',
    title: '13. Contact',
    body: 'If you have questions about this Privacy Policy or your personal data, please contact ePaS support through the app or via the support email listed on your Profile screen.',
  },
];

export default function PrivacyScreen() {
  const lastUpdated = '21 July 2026';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton style={styles.backBtn} />
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <LogoutButton color={COLORS.textPrimary} />
      </View>

      <ScreenBackground variant="default">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.introCard}>
            <View style={styles.introIconWrap}>
              <Ionicons name="shield-checkmark" size={26} color={COLORS.accent} />
            </View>
            <Text style={styles.introTitle}>ePaS Privacy Policy</Text>
            <Text style={styles.introSub}>Last updated: {lastUpdated}</Text>
            <Text style={styles.introBody}>
              This policy describes how ePaS collects, uses, and protects your personal data.
              It applies to all users regardless of whether you are a Customer, Trader,
              or Admin.
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
