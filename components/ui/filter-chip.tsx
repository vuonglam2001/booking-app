import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(selected ? colors.primary : colors.surface, {
      duration: 200,
    }),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: withTiming(selected ? colors.primaryForeground : colors.textSecondary, {
      duration: 200,
    }),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? colors.primary : colors.border },
        animatedStyle,
      ]}>
      <Animated.Text style={[Typography.bodySm, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
});
