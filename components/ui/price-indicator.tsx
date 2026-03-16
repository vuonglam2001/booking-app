import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { formatPriceRange } from '@/utils/format';

interface PriceIndicatorProps {
  priceRange: { min: number; max: number };
}

export function PriceIndicator({ priceRange }: PriceIndicatorProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <Text style={[styles.text, { color: colors.textSecondary }]}>
      {formatPriceRange(priceRange.min, priceRange.max)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 11,
    lineHeight: 16,
  },
});
