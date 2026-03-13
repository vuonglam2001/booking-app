import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import type { ReservationStatus } from '@/types';

interface BookingStatusBadgeProps {
  status: ReservationStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'ongoing':
        return colors.primary;
      case 'completed':
        return colors.textSecondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor();
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: statusColor + '1A' }]}>
      <Text style={[Typography.caption, styles.label, { color: statusColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
});
