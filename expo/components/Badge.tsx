import { Ionicons } from '@expo/vector-icons';
import type { BadgeLevel } from '@/types';
import { COLORS } from '@/constants/colors';
import { StyleSheet, View, Text } from 'react-native';
import React from 'react';

const BADGE_CONFIG: Record<BadgeLevel, { color: string; label: string; icon: string }> = {
  NEW: { color: COLORS.badgeNew, label: 'New', icon: 'sparkle' },
  RISING_STAR: { color: COLORS.badgeRisingStar, label: 'Rising Star', icon: 'star' },
  VERIFIED_PRO: { color: COLORS.badgeVerifiedPro, label: 'Verified Pro', icon: 'checkmark-circle' },
  MASTER: { color: COLORS.badgeMaster, label: 'Master', icon: 'trophy' },
};

interface BadgeProps {
  level: BadgeLevel;
  size?: 'sm' | 'md';
}

export function Badge({ level, size = 'sm' }: BadgeProps) {
  const config = BADGE_CONFIG[level];
  const isSm = size === 'sm';
  return (
    <View style={[styles.container, { backgroundColor: `${config.color}20`, borderColor: `${config.color}30` }]}>
      <Ionicons name={config.icon as any} size={isSm ? 11 : 13} color={config.color} />
      <Text style={[styles.text, { color: config.color, fontSize: isSm ? 10 : 12 }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
});
