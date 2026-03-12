import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={styles.container}>
      <IconSymbol
        name={icon as any}
        size={48}
        color={colors.textTertiary}
        style={styles.icon}
      />
      <Text style={[Typography.h3, styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text
        style={[
          Typography.bodySm,
          styles.description,
          { color: colors.textSecondary },
        ]}>
        {description}
      </Text>
      {action && (
        <Pressable
          onPress={action.onPress}
          style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={[Typography.buttonSm, { color: colors.primaryForeground }]}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  icon: {
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
});
