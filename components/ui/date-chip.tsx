import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';

interface DateChipProps {
  date: Date;
  selected: boolean;
  onPress: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DateChip({ date, selected, onPress }: DateChipProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const dayName = DAY_NAMES[date.getDay()];
  const dateNumber = date.getDate();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}>
      <Text
        style={[
          Typography.caption,
          {
            color: selected ? colors.primaryForeground : colors.textSecondary,
          },
        ]}>
        {dayName}
      </Text>
      <Text
        style={[
          Typography.bodySm,
          {
            color: selected ? colors.primaryForeground : colors.text,
            fontWeight: '600',
          },
        ]}>
        {dateNumber}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 52,
  },
});
