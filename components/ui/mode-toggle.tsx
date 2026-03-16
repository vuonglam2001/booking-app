import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import type { AppMode } from '@/types';

const TABS: { mode: AppMode; label: string; icon: 'restaurant' | 'nightlife' }[] = [
  { mode: 'dining', label: 'Restaurant', icon: 'restaurant' },
  { mode: 'nightlife', label: 'Nightlife', icon: 'nightlife' },
];

export function ModeToggle() {
  const { mode, setMode } = useAppMode();
  const colors = ThemeColors[mode];

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {TABS.map((tab) => {
        const isActive = mode === tab.mode;
        return (
          <Pressable
            key={tab.mode}
            onPress={() => setMode(tab.mode)}
            style={[
              styles.tab,
              isActive && { backgroundColor: colors.primary },
            ]}>
            <MaterialIcons
              name={tab.icon}
              size={20}
              color={isActive ? colors.primaryForeground : colors.textSecondary}
            />
            <Text
              style={[
                Typography.buttonSm,
                {
                  color: isActive ? colors.primaryForeground : colors.textSecondary,
                },
              ]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: 1,
    padding: 4,
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
});
