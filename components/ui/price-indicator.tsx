import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import type { PriceLevel } from '@/types';

interface PriceIndicatorProps {
  level: PriceLevel;
}

const MAX_LEVEL = 4;

export function PriceIndicator({ level }: PriceIndicatorProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={styles.container}>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <Text
          key={i}
          style={[
            Typography.caption,
            {
              color: i < level ? colors.text : colors.textTertiary,
              fontWeight: '600',
            },
          ]}>
          $
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});
