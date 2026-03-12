import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { strings } from '@/constants/i18n';
import { useAppMode } from '@/hooks/use-app-mode';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { AppMode } from '@/types';

export default function OnboardingScreen() {
  const { mode, setMode } = useAppMode();
  const colors = ThemeColors[mode];

  const fadeIn = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleSelect = (selectedMode: AppMode) => {
    setMode(selectedMode);
    router.replace('/(tabs)');
  };

  const diningColors = ThemeColors.dining;
  const nightlifeColors = ThemeColors.nightlife;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>Spotly</Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {strings.onboarding.subtitle}
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <Pressable
            onPress={() => handleSelect('dining')}
            style={[
              styles.card,
              {
                backgroundColor: diningColors.surface,
                borderColor: diningColors.border,
              },
            ]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: diningColors.primary + '1A' },
              ]}>
              <IconSymbol name="star.fill" size={32} color={diningColors.primary} />
            </View>
            <Text
              style={[
                Typography.h2,
                { color: diningColors.text, marginTop: Spacing.md },
              ]}>
              {strings.onboarding.dining}
            </Text>
            <Text
              style={[
                Typography.bodySm,
                {
                  color: diningColors.textSecondary,
                  marginTop: Spacing.xs,
                  textAlign: 'center',
                },
              ]}>
              {strings.onboarding.diningDesc}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelect('nightlife')}
            style={[
              styles.card,
              {
                backgroundColor: nightlifeColors.surfaceElevated,
                borderColor: nightlifeColors.border,
              },
            ]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: nightlifeColors.primary + '1A' },
              ]}>
              <IconSymbol
                name="star.fill"
                size={32}
                color={nightlifeColors.primary}
              />
            </View>
            <Text
              style={[
                Typography.h2,
                { color: nightlifeColors.text, marginTop: Spacing.md },
              ]}>
              {strings.onboarding.nightlife}
            </Text>
            <Text
              style={[
                Typography.bodySm,
                {
                  color: nightlifeColors.textSecondary,
                  marginTop: Spacing.xs,
                  textAlign: 'center',
                },
              ]}>
              {strings.onboarding.nightlifeDesc}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
