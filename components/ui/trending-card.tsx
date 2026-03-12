import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { Venue } from '@/types';

interface TrendingCardProps {
  venue: Venue;
  onPress: () => void;
  width?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];

export function TrendingCard({ venue, onPress, width = 200 }: TrendingCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cuisineLabel = venue.cuisineTypes?.[0]
    ?? venue.musicTypes?.[0]
    ?? venue.type;
  const displayCuisine = cuisineLabel.charAt(0).toUpperCase() + cuisineLabel.slice(1);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={[styles.card, { width }, animatedStyle]}>
      <Image
        source={{ uri: venue.imageUrl }}
        style={[styles.image, { width }]}
        resizeMode="cover"
      />
      {/* Dark gradient overlay */}
      <View style={styles.gradient} />
      {/* Content overlay */}
      <View style={styles.overlay}>
        <Text style={styles.name} numberOfLines={1}>
          {venue.name}
        </Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="star" size={13} color="#FBBF24" />
          <Text style={styles.metaText}>
            {venue.rating}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>
            {displayCuisine}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>
            {PRICE_LABELS[venue.priceLevel]}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: Spacing.sm,
    height: 160,
  },
  image: {
    height: 160,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    // A simple gradient effect using two overlapping views
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm + 2,
    paddingTop: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  name: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  dot: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});
