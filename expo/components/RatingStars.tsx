import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import React from 'react';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  color?: string;
}

export function RatingStars({ rating, size = 14, showNumber = false, color = '#FFB547' }: RatingStarsProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    let iconName: string;
    if (i < fullStars) {
      iconName = 'star';
    } else if (i === fullStars && hasHalf) {
      iconName = 'star-half';
    } else {
      iconName = 'star-outline';
    }
    stars.push(
      <Ionicons key={i} name={iconName as any} size={size} color={color} />
    );
  }

  return (
    <View style={styles.container} accessible accessibilityLabel={`Rating: ${rating} out of 5`}>
      {stars}
      {showNumber && (
        <View style={styles.numberWrap}>
          <Ionicons name="star" size={size} color={color} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  numberWrap: {
    marginLeft: 4,
  },
});
