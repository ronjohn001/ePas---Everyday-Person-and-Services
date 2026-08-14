import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import type { UserRole } from '@/types';

interface ScreenBackgroundProps {
  children: ReactNode;
  variant?: 'default' | 'profile' | 'login' | 'provider' | 'admin';
  style?: object;
}

/**
 * Ambient gradient background used behind all screens.
 * Creates depth with a dark space-black base and role-themed aurora glows.
 */
export function ScreenBackground({ children, variant = 'default', style }: ScreenBackgroundProps) {
  const gradients: Record<string, readonly string[]> = {
    default: [COLORS.primaryDark, COLORS.primary, COLORS.primaryDark],
    profile: [COLORS.primaryDark, COLORS.primaryLight, COLORS.primaryDark],
    login: [COLORS.primaryDark, '#0A2540', COLORS.primary],
    provider: [COLORS.primaryDark, '#0A1830', COLORS.primary],
    admin: [COLORS.primaryDark, '#1A0A28', COLORS.primary],
  };

  const glowColor =
    variant === 'provider' ? COLORS.providerAccent :
    variant === 'admin' ? COLORS.adminAccent :
    COLORS.accent;

  const glowColor2 =
    variant === 'provider' ? COLORS.cyan :
    variant === 'admin' ? COLORS.violet :
    COLORS.violet;

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradients[variant] as unknown as [string, string, string]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      {/* Ambient aurora glows */}
      <View style={[styles.glowTopLeft, { backgroundColor: glowColor }]} pointerEvents="none" />
      <View style={[styles.glowBottomRight, { backgroundColor: glowColor2 }]} pointerEvents="none" />
      <View style={[styles.glowCenter, { backgroundColor: glowColor }]} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -140,
    left: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.07,
    zIndex: 0,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -120,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.06,
    zIndex: 0,
  },
  glowCenter: {
    position: 'absolute',
    top: '40%',
    left: '60%',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.04,
    zIndex: 0,
  },
});
