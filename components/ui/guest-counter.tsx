import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
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
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(String(value));

  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  const handleStartEdit = () => {
    setEditText(String(value));
    setIsEditing(true);
  };

  const handleEndEdit = () => {
    setIsEditing(false);
    const parsed = parseInt(editText, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
    }
  };

  const handleChangeText = (text: string) => {
    // Only allow digits
    const digits = text.replace(/[^0-9]/g, '');
    setEditText(digits);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={isMinDisabled}
        style={[
          styles.button,
          {
            backgroundColor: colors.surface,
            borderColor: isMinDisabled ? colors.inputBackground : colors.border,
          },
        ]}>
        <IconSymbol
          name="minus"
          size={20}
          color={isMinDisabled ? colors.textTertiary : colors.text}
        />
      </Pressable>

      <Pressable onPress={handleStartEdit} style={styles.center}>
        {isEditing ? (
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={editText}
            onChangeText={handleChangeText}
            onBlur={handleEndEdit}
            onSubmitEditing={handleEndEdit}
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.count, { color: colors.text }]}>
            {value}
          </Text>
        )}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {value === 1 ? strings.common.guest : strings.common.guests}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={isMaxDisabled}
        style={[
          styles.button,
          {
            backgroundColor: isMaxDisabled ? colors.inputBackground : colors.primary,
            borderColor: isMaxDisabled ? colors.inputBackground : colors.primary,
          },
        ]}>
        <IconSymbol
          name="plus"
          size={20}
          color={isMaxDisabled ? colors.textTertiary : '#FFFFFF'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  count: {
    fontFamily: FontFamily.displayBold,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  input: {
    fontFamily: FontFamily.displayBold,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    minWidth: 60,
    padding: 0,
  },
  label: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
