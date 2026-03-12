import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { RatingBadge } from '@/components/ui/rating-badge';
import { PriceIndicator } from '@/components/ui/price-indicator';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { strings } from '@/constants/i18n';
import { useAppMode } from '@/hooks/use-app-mode';
import { useAuth } from '@/hooks/use-auth';
import { getVenueById } from '@/data';
import { formatTime } from '@/utils/format';
import type { Review } from '@/types';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Sarah L.',
    rating: 5,
    text: 'Absolutely amazing experience! The food was incredible and the atmosphere was perfect. Will definitely come back.',
    date: '2025-12-15',
  },
  {
    id: 'r2',
    userName: 'Michael T.',
    rating: 4,
    text: 'Great place with wonderful service. The menu has a lot of variety. Only minor issue was the wait time.',
    date: '2025-11-28',
  },
  {
    id: 'r3',
    userName: 'Emily N.',
    rating: 4.5,
    text: 'One of my favorite spots in the city. The ambiance is top-notch and the staff are very friendly.',
    date: '2025-11-10',
  },
];

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];
  const { isAuthenticated } = useAuth();

  const venue = getVenueById(id);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  if (!venue) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[Typography.body, { color: colors.textSecondary }]}>
          Venue not found
        </Text>
      </View>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      router.push({ pathname: '/booking/[venueId]', params: { venueId: venue.id } });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <IconSymbol
          key={i}
          name="star.fill"
          size={14}
          color={i < fullStars ? colors.warning : colors.textTertiary}
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: venue.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: 'rgba(0,0,0,0.4)' },
            ]}>
            <IconSymbol name="arrow.left" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Venue Info */}
        <View style={styles.infoSection}>
          <Text style={[Typography.h1, { color: colors.text }]}>
            {venue.name}
          </Text>
          <View style={styles.metaRow}>
            <RatingBadge rating={venue.rating} />
            <PriceIndicator level={venue.priceLevel} />
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              ({venue.reviewCount} reviews)
            </Text>
          </View>

          {/* Address */}
          <View style={styles.addressRow}>
            <IconSymbol name="mappin" size={16} color={colors.textSecondary} />
            <Text
              style={[
                Typography.bodySm,
                { color: colors.textSecondary, flex: 1, marginLeft: Spacing.xs },
              ]}>
              {venue.address}, {venue.district}, {venue.city}
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {venue.tags.map((tag) => (
              <FilterChip
                key={tag}
                label={tag}
                selected={false}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.venue.about}
          </Text>
          <Text
            style={[
              Typography.body,
              { color: colors.textSecondary, marginTop: Spacing.sm },
            ]}
            numberOfLines={descriptionExpanded ? undefined : 3}>
            {venue.description}
          </Text>
          <Pressable onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
            <Text
              style={[
                Typography.bodySm,
                {
                  color: colors.primary,
                  marginTop: Spacing.xs,
                  fontWeight: '600',
                },
              ]}>
              {descriptionExpanded ? 'Show less' : strings.venue.readMore}
            </Text>
          </Pressable>
        </View>

        {/* Hours */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.venue.hours}
          </Text>
          <View style={styles.hoursRow}>
            <IconSymbol name="clock" size={16} color={colors.textSecondary} />
            <Text
              style={[
                Typography.body,
                { color: colors.textSecondary, marginLeft: Spacing.sm },
              ]}>
              {formatTime(venue.hours.open)} - {formatTime(venue.hours.close)}
            </Text>
          </View>
        </View>

        {/* Photos */}
        {venue.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.h3, { color: colors.text }]}>
              {strings.venue.photos}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}>
              {venue.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photoThumbnail}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.venue.reviews}
          </Text>
          {MOCK_REVIEWS.map((review) => (
            <View
              key={review.id}
              style={[
                styles.reviewCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.reviewHeader}>
                <Text
                  style={[
                    Typography.bodySm,
                    { color: colors.text, fontWeight: '600' },
                  ]}>
                  {review.userName}
                </Text>
                <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
              </View>
              <Text
                style={[
                  Typography.bodySm,
                  { color: colors.textSecondary, marginTop: Spacing.xs },
                ]}>
                {review.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom spacer for sticky bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}>
        <Button
          title={strings.venue.bookNow}
          onPress={handleBookNow}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  photosScroll: {
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  photoThumbnail: {
    width: 140,
    height: 100,
    borderRadius: 10,
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
  },
});
