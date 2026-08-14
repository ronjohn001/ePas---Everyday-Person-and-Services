import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeGoBack } from '@/hooks/use-safe-go-back';

type BackButtonProps = {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Header back button with a safe fallback: pops the stack when possible,
 * otherwise routes to the signed-in role's home tab so nobody hits a dead end.
 */
export function BackButton({ color = COLORS.textPrimary, size = 22, style }: BackButtonProps) {
  const goBack = useSafeGoBack();

  return (
    <TouchableOpacity
      style={style}
      onPress={goBack}
      hitSlop={12}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
}
