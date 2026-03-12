import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';

interface TimeSlotProps {
  time: string;
  available: boolean;
  selected: boolean;
  onPress: () => void;
}

export function TimeSlot({ time, available, selected, onPress }: TimeSlotProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const backgroundColor = selected
    ? colors.primary
    : available
      ? colors.surface
      : colors.inputBackground;

  const textColor = selected
    ? colors.primaryForeground
    : available
      ? colors.text
      : colors.textTertiary;

  const borderColor = selected
    ? colors.primary
    : available
      ? colors.border
      : colors.inputBackground;

  return (
    <Pressable
      onPress={onPress}
      disabled={!available}
      style={[
        styles.slot,
        { backgroundColor, borderColor },
      ]}>
      <Text style={[Typography.bodySm, { color: textColor, fontWeight: '500' }]}>
        {time}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    margin: Spacing.xs,
  },
});
