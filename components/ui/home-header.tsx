import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

export function HomeHeader({ onNotificationPress, onAvatarPress }: HomeHeaderProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <MaterialIcons name="place" size={22} color={colors.primary} />
        <Text style={[Typography.brand, { color: colors.text }]}>Spotly</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onNotificationPress} hitSlop={8} style={styles.iconButton}>
          <MaterialIcons name="notifications-none" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={onAvatarPress} hitSlop={8}>
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <MaterialIcons name="person" size={18} color={colors.textSecondary} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
