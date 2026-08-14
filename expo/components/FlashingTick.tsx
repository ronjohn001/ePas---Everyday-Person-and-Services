import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type Props = {
  size?: number;
  color?: string;
  interval?: number;
};

/**
 * A checkmark/tick icon that pulses (flashes) opacity in a loop.
 */
export function FlashingTick({
  size = 24,
  color = COLORS.accent,
  interval = 900,
}: Props) {
  const opacity = useRef(new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 0.2,
          duration: interval,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: interval,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [interval]);

  return (
    <Animated.View style={[{ opacity: opacity.current }, styles.wrap]}>
      <Ionicons name="checkmark-circle" size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center' },
});
