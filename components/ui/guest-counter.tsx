import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface GuestCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function GuestCounter({
  value,
  onChange,
  min = 1,
  max = 20,
}: GuestCounterProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={isMinDisabled}
        style={[
          styles.button,
          {
            backgroundColor: isMinDisabled ? colors.inputBackground : colors.surface,
            borderColor: isMinDisabled ? colors.inputBackground : colors.border,
          },
        ]}>
        <IconSymbol
          name="minus"
          size={20}
          color={isMinDisabled ? colors.textTertiary : colors.text}
        />
      </Pressable>
      <Text style={[Typography.h3, styles.count, { color: colors.text }]}>
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={isMaxDisabled}
        style={[
          styles.button,
          {
            backgroundColor: isMaxDisabled ? colors.inputBackground : colors.surface,
            borderColor: isMaxDisabled ? colors.inputBackground : colors.border,
          },
        ]}>
        <IconSymbol
          name="plus"
          size={20}
          color={isMaxDisabled ? colors.textTertiary : colors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    minWidth: 48,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
});
