import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const FLASH_COLORS = ['#00FFA3', '#4FC3F7', '#B26CFF', '#FF5C7A', '#FFB74D', '#00FFA3'];

export interface FlashingBookButtonProps {
  onPress: () => void;
  label?: string;
  /** Stretch to fill the parent (e.g. bottom CTA bars). */
  fill?: boolean;
}

/**
 * Attention-grabbing booking CTA whose background cycles through neon colours.
 * Colour interpolation runs on the JS driver (backgroundColor cannot use the
 * native driver), which is fine for a few small buttons per screen.
 */
export function FlashingBookButton({ onPress, label = 'Book', fill = false }: FlashingBookButtonProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: FLASH_COLORS.length - 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const backgroundColor = progress.interpolate({
    inputRange: FLASH_COLORS.map((_, i) => i),
    outputRange: FLASH_COLORS,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={fill ? styles.fill : undefined}
    >
      <Animated.View style={[styles.button, fill && styles.fill, { backgroundColor }]}>
        <Ionicons name="flash" size={14} color={COLORS.navy} />
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: 0.3,
  },
});
