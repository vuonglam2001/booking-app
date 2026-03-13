import React, { useCallback, useEffect, useState } from 'react';
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

import { EmptyState } from '@/components/ui/empty-state';
import { StarRating } from '@/components/ui/star-rating';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { getReviews } from '@/data/reviews';
import { getVenueById } from '@/data';
import type { BookingReview } from '@/types';

interface ReviewWithVenue extends BookingReview {
  venueName: string;
  venueImage: string;
  venueId: string;
}

export default function ReviewsScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const [reviews, setReviews] = useState<ReviewWithVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allReviews = await getReviews();
      const enriched: ReviewWithVenue[] = allReviews.map((r) => {
        const venue = getVenueById(r.restaurantId);
        return {
          ...r,
          venueName: venue?.name ?? 'Unknown',
          venueImage: venue?.imageUrl ?? '',
          venueId: r.restaurantId,
        };
      });
      // Most recent first
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(enriched);
      setLoading(false);
    }
    load();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ReviewWithVenue }) => {
      const date = new Date(item.createdAt);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return (
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/booking-detail/[id]',
              params: { id: item.bookingId },
            })
          }
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={styles.cardTop}>
            <Image
              source={{ uri: item.venueImage }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardInfo}>
              <Text
                style={[styles.cardName, { color: colors.text }]}
                numberOfLines={1}>
                {item.venueName}
              </Text>
              <StarRating value={item.rating} disabled size={16} />
              <Text style={[styles.cardDate, { color: colors.textTertiary }]}>
                {dateStr}
              </Text>
            </View>
          </View>
          {item.comment ? (
            <Text
              style={[styles.cardComment, { color: colors.textSecondary }]}
              numberOfLines={3}>
              "{item.comment}"
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [colors],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="star"
          title={strings.profile.reviews}
          description={
            mode === 'dining'
              ? 'Your restaurant reviews will appear here'
              : 'Your venue reviews will appear here'
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.bookingId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
            {reviews.length} {strings.profile.reviews.toLowerCase()}
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
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 21,
  },
  cardDate: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  cardComment: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
});
