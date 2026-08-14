import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import React from 'react';

interface CategoryIconProps {
  name: string;
  color: string;
  size?: number;
  bg?: boolean;
  bgSize?: number;
}

export function CategoryIcon({ name, color, size = 24, bg = false, bgSize = 56 }: CategoryIconProps) {
  if (bg) {
    return (
      <CategoryIconBg name={name} color={color} size={size} bgSize={bgSize} />
    );
  }
  return <Ionicons name={name as any} size={size} color={color} />;
}

function CategoryIconBg({ name, color, size, bgSize }: { name: string; color: string; size: number; bgSize: number }) {
  return (
    <CategoryIconBgStyled name={name} color={color} size={size} bgSize={bgSize} />
  );
}

import { View, StyleSheet as RNStyleSheet } from 'react-native';

function CategoryIconBgStyled({ name, color, size, bgSize }: { name: string; color: string; size: number; bgSize: number }) {
  return (
    <View style={[styles.bg, { width: bgSize, height: bgSize, borderRadius: bgSize / 2, backgroundColor: `${color}18` }]}>
      <Ionicons name={name as any} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
