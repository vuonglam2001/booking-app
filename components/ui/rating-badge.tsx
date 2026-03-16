import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface RatingBadgeProps {
  rating: number;
}

export function RatingBadge({ rating }: RatingBadgeProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={[styles.badge, { backgroundColor: colors.inputBackground }]}>
      <IconSymbol name="star.fill" size={14} color={colors.warning} />
      <Text style={[Typography.caption, styles.text, { color: colors.text }]}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});
