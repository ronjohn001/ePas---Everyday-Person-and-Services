import type { BookingStatus } from '@/types';
import { COLORS } from '@/constants/colors';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const STATUS_CONFIG: Record<BookingStatus, { color: string; label: string }> = {
  REQUESTED: { color: COLORS.statusRequested, label: 'Requested' },
  ACCEPTED: { color: COLORS.statusAccepted, label: 'Accepted' },
  EN_ROUTE: { color: COLORS.statusEnRoute, label: 'En Route' },
  IN_PROGRESS: { color: COLORS.statusInProgress, label: 'In Progress' },
  COMPLETED: { color: COLORS.statusCompleted, label: 'Completed' },
  DECLINED: { color: COLORS.statusDeclined, label: 'Declined' },
  CANCELLED: { color: COLORS.statusCancelled, label: 'Cancelled' },
  DISPUTED: { color: COLORS.statusDisputed, label: 'Disputed' },
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.container, { backgroundColor: `${config.color}1A`, borderColor: `${config.color}30` }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
