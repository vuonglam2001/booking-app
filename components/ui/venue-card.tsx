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

interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
  width?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VenueCard({ venue, onPress, width = 220 }: VenueCardProps) {
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
        scale.value = withSpring(0.96, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={[
        styles.card,
        { width, backgroundColor: colors.surface },
        animatedStyle,
      ]}>
      <Image
        source={{ uri: venue.imageUrl }}
        style={[styles.image, { width }]}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text
          style={[Typography.bodySm, { color: colors.text, fontWeight: '600' }]}
          numberOfLines={1}>
          {venue.name}
        </Text>
        {venue.tags.length > 0 && (
          <Text
            style={[Typography.caption, { color: colors.textSecondary }]}
            numberOfLines={1}>
            {venue.tags.join(' · ')}
          </Text>
        )}
        <View style={styles.footer}>
          <RatingBadge rating={venue.rating} />
          <PriceIndicator priceRange={venue.priceRange} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  image: {
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
});
