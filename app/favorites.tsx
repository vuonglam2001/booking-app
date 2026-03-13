import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { EmptyState } from '@/components/ui/empty-state';
import { ThemeColors, type ThemeColorKeys } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useFavorites } from '@/hooks/use-favorites';
import { getAllVenues } from '@/data';
import { formatPriceRange } from '@/utils/format';
import type { Venue } from '@/types';

const CARD_IMAGE_SIZE = 96;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FavoriteCard({
  venue,
  colors,
  onPress,
  onRemove,
}: {
  venue: Venue;
  colors: ThemeColorKeys;
  onPress: () => void;
  onRemove: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cuisineLabel =
    venue.cuisineTypes?.[0] ?? venue.musicTypes?.[0] ?? venue.type;
  const displayCuisine =
    cuisineLabel.charAt(0).toUpperCase() + cuisineLabel.slice(1);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        animatedStyle,
      ]}>
      {/* Image */}
      <Image
        source={{ uri: venue.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardName, { color: colors.text }]}
          numberOfLines={1}>
          {venue.name}
        </Text>

        <View style={styles.cardAddressRow}>
          <MaterialIcons name="location-on" size={13} color={colors.textTertiary} />
          <Text
            style={[styles.cardAddress, { color: colors.textSecondary }]}
            numberOfLines={1}>
            {venue.address}, {venue.district}
          </Text>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.ratingPill}>
            <MaterialIcons name="star" size={13} color="#FBBF24" />
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {venue.rating}
            </Text>
          </View>
          <Text style={[styles.priceText, { color: colors.textSecondary }]}>
            {formatPriceRange(venue.priceRange.min, venue.priceRange.max)}
          </Text>
          <View style={[styles.cuisinePill, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.cuisineText, { color: colors.primary }]}>
              {displayCuisine}
            </Text>
          </View>
        </View>
      </View>

      {/* Heart remove button */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={[styles.heartBtn, { backgroundColor: colors.error + '12' }]}
        hitSlop={6}>
        <MaterialIcons name="favorite" size={18} color={colors.error} />
      </Pressable>
    </AnimatedPressable>
  );
}

export default function FavoritesScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const { favoriteIds, toggleFavorite } = useFavorites();

  const favoriteVenues = useMemo(() => {
    const all = getAllVenues();
    return all.filter((v) => favoriteIds.includes(v.id));
  }, [favoriteIds]);

  const renderVenue = useCallback(
    ({ item }: { item: Venue }) => (
      <FavoriteCard
        venue={item}
        colors={colors}
        onPress={() =>
          router.push({ pathname: '/venue/[id]', params: { id: item.id } })
        }
        onRemove={() => toggleFavorite(item.id)}
      />
    ),
    [colors, toggleFavorite],
  );

  if (favoriteVenues.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="heart"
          title={strings.profile.savedVenues}
          description={
            mode === 'dining'
              ? 'Tap the heart on restaurants you love to save them here'
              : 'Tap the heart on venues you love to save them here'
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favoriteVenues}
        renderItem={renderVenue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
            {favoriteVenues.length} {strings.profile.favorites.toLowerCase()}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  countLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm + 2,
    alignItems: 'center',
    gap: Spacing.md - 2,
  },
  cardImage: {
    width: CARD_IMAGE_SIZE,
    height: CARD_IMAGE_SIZE,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 5,
  },
  cardName: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 21,
  },
  cardAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardAddress: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  priceText: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  cuisinePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cuisineText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 15,
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
