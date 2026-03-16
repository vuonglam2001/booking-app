import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import type { AppMode } from '@/types';

type CategoryKey = 'dining' | 'nightlife';

interface CategoryItem {
  key: CategoryKey;
  labelKey: 'dining' | 'nightlife';
  icon: keyof typeof MaterialIcons.glyphMap;
  mode?: AppMode;
}

const CATEGORIES: CategoryItem[] = [
  { key: 'dining', labelKey: 'dining', icon: 'restaurant', mode: 'dining' },
  { key: 'nightlife', labelKey: 'nightlife', icon: 'nightlife', mode: 'nightlife' },
];

interface CategoryTabsProps {
  selected: CategoryKey;
  onSelect: (key: CategoryKey) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];

  return (
    <View style={styles.container}>
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.key;
        return (
          <Pressable
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            style={[
              styles.tab,
              {
                borderColor: isActive ? colors.primary : colors.border,
                backgroundColor: isActive ? colors.primary + '12' : 'transparent',
              },
            ]}>
            <MaterialIcons
              name={cat.icon}
              size={22}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                },
              ]}>
              {strings.onboarding[cat.labelKey]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { CategoryKey };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
    minWidth: 72,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
});
