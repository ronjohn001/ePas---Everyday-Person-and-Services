import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/colors';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
  radius?: keyof typeof RADIUS;
  glow?: boolean;
  borderless?: boolean;
}

/**
 * Translucent glass-surface card with blur backdrop.
 * Uses BlurView on iOS, semi-transparent fallback on Android.
 */
export function GlassCard({ children, style, intensity = 40, radius = 'lg', glow = false, borderless = false }: GlassCardProps) {
  const radiusVal = RADIUS[radius];
  return (
    <View
      style={[
        styles.container,
        { borderRadius: radiusVal, shadowColor: glow ? COLORS.accent : '#000' },
        glow && SHADOWS.glow,
        !borderless && { borderWidth: 1, borderColor: COLORS.glassBorder },
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radiusVal }]}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { borderRadius: radiusVal, backgroundColor: COLORS.glassBg }]} />
      )}
      <View style={styles.innerContent}>{children}</View>
    </View>
  );
}

interface GradientCardProps {
  children: ReactNode;
  style?: ViewStyle;
  colors?: readonly string[];
  radius?: keyof typeof RADIUS;
}

/**
 * Card with a subtle gradient surface — used for hero/featured cards.
 */
export function GradientCard({
  children,
  style,
  colors = ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)'],
  radius = 'lg',
}: GradientCardProps) {
  const radiusVal = RADIUS[radius];
  return (
    <View
      style={[
        styles.container,
        { borderRadius: radiusVal, borderWidth: 1, borderColor: COLORS.glassBorder },
        SHADOWS.card,
        style,
      ]}
    >
      <LinearGradient
        colors={colors as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radiusVal }]}
      />
      <View style={styles.innerContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  innerContent: {
    position: 'relative',
    zIndex: 1,
  },
});
