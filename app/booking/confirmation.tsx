import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useBookings } from '@/hooks/use-bookings';
import { formatDate, formatTime } from '@/utils/format';

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mode } = useAppMode();
  const { language, strings } = useLanguage();
  const colors = ThemeColors[mode];
  const dateLocale = language === 'vi' ? 'vi-VN' : 'en-US';
  const { reservations } = useBookings();

  const reservation = useMemo(
    () => reservations.find((r) => r.id === id),
    [reservations, id]
  );

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSpring(1, {
      damping: 12,
      stiffness: 120,
    });
    checkOpacity.value = withSpring(1, {
      damping: 12,
      stiffness: 120,
    });
  }, []);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  if (!reservation) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            Reservation not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Animated Checkmark */}
        <Animated.View
          style={[
            styles.checkCircle,
            { backgroundColor: colors.success + '1A' },
            animatedCheckStyle,
          ]}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={64}
            color={colors.success}
          />
        </Animated.View>

        {/* Title */}
        <Text
          style={[
            Typography.h1,
            { color: colors.text, textAlign: 'center', marginTop: Spacing.lg },
          ]}>
          {strings.confirmation.title}
        </Text>
        <Text
          style={[
            Typography.body,
            {
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: Spacing.sm,
            },
          ]}>
          {strings.confirmation.subtitle}
        </Text>

        {/* Details Card */}
        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <DetailRow
            label={strings.confirmation.reservationId}
            value={`#${reservation.id.slice(-6)}`}
            colors={colors}
          />
          <DetailRow
            label={strings.confirmation.venue}
            value={reservation.venueName}
            colors={colors}
          />
          <DetailRow
            label={strings.confirmation.date}
            value={formatDate(reservation.date, dateLocale)}
            colors={colors}
          />
          <DetailRow
            label={strings.confirmation.time}
            value={formatTime(reservation.time)}
            colors={colors}
          />
          <DetailRow
            label={strings.confirmation.guests}
            value={`${reservation.guests}`}
            colors={colors}
            isLast={!reservation.phoneNumber}
          />
          {reservation.phoneNumber && (
            <DetailRow
              label={strings.confirmation.phone}
              value={reservation.phoneNumber}
              colors={colors}
              isLast
            />
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title={strings.confirmation.viewBookings}
            onPress={() => router.replace('/(tabs)/bookings')}
            fullWidth
          />
          <View style={{ height: Spacing.sm }} />
          <Button
            title={strings.confirmation.backHome}
            onPress={() => router.replace('/(tabs)')}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  colors,
  isLast = false,
}: {
  label: string;
  value: string;
  colors: ReturnType<() => typeof ThemeColors['dining']>;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        detailRowStyles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}>
      <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[Typography.bodySm, { color: colors.text, fontWeight: '600' }]}>
        {value}
      </Text>
    </View>
  );
}

const detailRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: Spacing.xl,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: Spacing.xl,
  },
});
