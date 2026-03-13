import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { useAppMode } from '@/hooks/use-app-mode';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

export function StarRating({ value, onChange, size = 32, disabled = false }: StarRatingProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => !disabled && onChange?.(star)}
          disabled={disabled}
          hitSlop={4}
          style={styles.star}>
          <MaterialIcons
            name={star <= value ? 'star' : 'star-border'}
            size={size}
            color={star <= value ? colors.warning : colors.textTertiary}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    padding: 2,
  },
});
