import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useBookings } from '@/hooks/use-bookings';
import { formatDate, formatTime } from '@/utils/format';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Reservation } from '@/types';

export default function BookingsScreen() {
  const { mode } = useAppMode();
  const { language, strings } = useLanguage();
  const colors = ThemeColors[mode];
  const { reservations } = useBookings();
  const dateLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  const upcoming = useMemo(
    () =>
      reservations.filter(
        (r) => r.date >= today && (r.status === 'confirmed' || r.status === 'ongoing')
      ),
    [reservations, today]
  );

  const past = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.date < today ||
          r.status === 'completed' ||
          r.status === 'cancelled'
      ),
    [reservations, today]
  );

  const renderReservationCard = (reservation: Reservation) => (
    <Pressable
      key={reservation.id}
      onPress={() => router.push({ pathname: '/booking-detail/[id]', params: { id: reservation.id } })}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
      <Image
        source={{ uri: reservation.venueImage }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text
          style={[Typography.bodySm, { color: colors.text, fontWeight: '600' }]}
          numberOfLines={1}>
          {reservation.venueName}
        </Text>
        <View style={styles.cardDetailRow}>
          <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {formatDate(reservation.date, dateLocale)} {strings.common.at} {formatTime(reservation.time)}
          </Text>
        </View>
        <View style={styles.cardDetailRow}>
          <IconSymbol name="person.2.fill" size={14} color={colors.textSecondary} />
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {reservation.guests}{' '}
            {reservation.guests === 1
              ? strings.common.guest
              : strings.common.guests}
          </Text>
        </View>
        <BookingStatusBadge status={reservation.status} />
      </View>
    </Pressable>
  );

  if (reservations.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[Typography.h1, styles.title, { color: colors.text }]}>
          {strings.bookings.title}
        </Text>
        <EmptyState
          icon="calendar"
          title={strings.bookings.empty}
          description={strings.bookings.emptyDesc}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[Typography.h1, styles.title, { color: colors.text }]}>
          {strings.bookings.title}
        </Text>

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                Typography.h3,
                styles.sectionTitle,
                { color: colors.text },
              ]}>
              {strings.bookings.upcoming}
            </Text>
            {upcoming.map(renderReservationCard)}
          </View>
        )}

        {past.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                Typography.h3,
                styles.sectionTitle,
                { color: colors.text },
              ]}>
              {strings.bookings.past}
            </Text>
            {past.map(renderReservationCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
