import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { BackButton } from '@/components/BackButton';
import { HOME_ROUTE_BY_ROLE, useSafeGoBack } from '@/hooks/use-safe-go-back';
import { useAuth } from '@/hooks/auth-store';

export default function NotFoundScreen() {
  const router = useRouter();
  const { role } = useAuth();
  const goBack = useSafeGoBack();

  return (
    <ScreenBackground>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton style={styles.backBtn} />
          <Text style={styles.headerTitle}>Screen Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="compass-outline" size={44} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>This page wandered off the map</Text>
          <Text style={styles.message}>
            The screen you were looking for doesn&apos;t exist or may have been moved.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={goBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textInverse} />
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace(HOME_ROUTE_BY_ROLE[role ?? 'CUSTOMER'])}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,255,163,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignSelf: 'stretch',
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textInverse },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignSelf: 'stretch',
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
});
