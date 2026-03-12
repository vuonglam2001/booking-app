import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { formatPriceRange } from '@/utils/format';
import type { Venue } from '@/types';

interface NearYouItemProps {
  venue: Venue;
  onPress: () => void;
}

export function NearYouItem({ venue, onPress }: NearYouItemProps) {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const cuisineLabel = venue.cuisineTypes?.[0]
    ?? venue.musicTypes?.[0]
    ?? venue.type;
  const displayCuisine = cuisineLabel.charAt(0).toUpperCase() + cuisineLabel.slice(1);

  // Mock distance
  const distance = (Math.random() * 2 + 0.2).toFixed(1);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surface }]}>
      <Image
        source={{ uri: venue.imageUrl }}
        style={styles.thumb}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={1}>
          {venue.name}
        </Text>
        <Text
          style={[styles.subtitle, { color: colors.textSecondary }]}
          numberOfLines={1}>
          {displayCuisine} · {formatPriceRange(venue.priceRange.min, venue.priceRange.max)} · {distance} km
        </Text>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star-outline" size={14} color={colors.primary} />
          <Text style={[styles.rating, { color: colors.text }]}>
            {venue.rating}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: 14,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  rating: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 13,
    lineHeight: 18,
  },
});
