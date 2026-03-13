import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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

  const handlePress = useCallback(
    (star: number) => {
      if (!disabled && onChange) {
        onChange(star);
      }
    },
    [disabled, onChange],
  );

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          activeOpacity={disabled ? 1 : 0.6}
          onPress={() => handlePress(star)}
          disabled={disabled}
          style={styles.star}>
          <MaterialIcons
            name={star <= value ? 'star' : 'star-border'}
            size={size}
            color={star <= value ? colors.warning : colors.textTertiary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  star: {
    padding: 4,
  },
});
