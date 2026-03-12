import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { RatingBadge } from '@/components/ui/rating-badge';
import { PriceIndicator } from '@/components/ui/price-indicator';
import type { Venue } from '@/types';

interface VenueListItemProps {
  venue: Venue;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VenueListItem({ venue, onPress }: VenueListItemProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        animatedStyle,
      ]}>
      <Image
        source={{ uri: venue.imageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text
          style={[Typography.bodySm, { color: colors.text, fontWeight: '600' }]}
          numberOfLines={1}>
          {venue.name}
        </Text>
        <Text
          style={[Typography.caption, { color: colors.textSecondary }]}
          numberOfLines={1}>
          {venue.address} · {venue.district}
        </Text>
        <View style={styles.metaRow}>
          <RatingBadge rating={venue.rating} />
          <PriceIndicator level={venue.priceLevel} />
          {venue.tags.length > 0 && (
            <Text
              style={[Typography.caption, { color: colors.textTertiary, flexShrink: 1 }]}
              numberOfLines={1}>
              {venue.tags.slice(0, 2).join(' · ')}
            </Text>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
});
