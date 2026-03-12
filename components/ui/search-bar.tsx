import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onSubmit?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onSubmit,
}: SearchBarProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
      <MaterialIcons
        name="auto-awesome"
        size={18}
        color={colors.primary}
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          Typography.body,
          { color: colors.text },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        onFocus={onFocus}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
