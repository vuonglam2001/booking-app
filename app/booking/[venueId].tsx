import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { DateChip } from '@/components/ui/date-chip';
import { TimeSlot } from '@/components/ui/time-slot';
import { GuestCounter } from '@/components/ui/guest-counter';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useBookings } from '@/hooks/use-bookings';
import { getVenueById } from '@/data';
import { formatTime } from '@/utils/format';
import type { Reservation } from '@/types';

function generateDates(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function generateTimeSlots(
  openTime: string,
  closeTime: string
): string[] {
  const slots: string[] = [];
  const [openH, openM] = openTime.split(':').map(Number);
  let [closeH] = closeTime.split(':').map(Number);

  // Handle overnight venues (e.g., 20:00 - 02:00)
  if (closeH <= openH) {
    closeH += 24;
  }

  let currentMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60) % 24;
    const m = currentMinutes % 60;
    slots.push(
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    );
    currentMinutes += 30;
  }
  return slots;
}

function isSlotUnavailable(
  venueId: string,
  time: string,
  dateIndex: number
): boolean {
  // Deterministic "random" based on venue id, time, and date
  let hash = 0;
  const seed = `${venueId}-${time}-${dateIndex}`;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) % 5 === 0; // ~20% unavailable
}

export default function BookingScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const { addReservation } = useBookings();

  const venue = getVenueById(venueId);

  const dates = useMemo(() => generateDates(14), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const timeSlots = useMemo(() => {
    if (!venue) return [];
    return generateTimeSlots(venue.hours.open, venue.hours.close);
  }, [venue]);

  if (!venue) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[Typography.body, { color: colors.textSecondary }]}>
          Venue not found
        </Text>
      </View>
    );
  }

  const handleConfirm = () => {
    if (!selectedTime) return;

    const selectedDate = dates[selectedDateIndex];
    const dateStr = selectedDate.toISOString().split('T')[0];
    const reservationId = Date.now().toString();

    const reservation: Reservation = {
      id: reservationId,
      venueId: venue.id,
      venueName: venue.name,
      venueImage: venue.imageUrl,
      date: dateStr,
      time: selectedTime,
      guests,
      specialRequests: specialRequests.trim() || undefined,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    addReservation(reservation);
    router.push(`/booking/confirmation?id=${reservationId}`);
  };

  const renderTimeSlot = ({ item }: { item: string }) => {
    const unavailable = isSlotUnavailable(venue.id, item, selectedDateIndex);
    return (
      <TimeSlot
        time={formatTime(item)}
        available={!unavailable}
        selected={selectedTime === item}
        onPress={() => setSelectedTime(item)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Venue Header */}
        <View style={styles.venueHeader}>
          <Image
            source={{ uri: venue.imageUrl }}
            style={styles.venueThumbnail}
            resizeMode="cover"
          />
          <View style={styles.venueHeaderInfo}>
            <Text
              style={[Typography.h3, { color: colors.text }]}
              numberOfLines={1}>
              {venue.name}
            </Text>
            <Text
              style={[Typography.caption, { color: colors.textSecondary }]}
              numberOfLines={1}>
              {venue.address}, {venue.district}
            </Text>
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.booking.selectDate}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}>
            {dates.map((date, index) => (
              <DateChip
                key={index}
                date={date}
                selected={selectedDateIndex === index}
                onPress={() => {
                  setSelectedDateIndex(index);
                  setSelectedTime(null);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Select Time */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.booking.selectTime}
          </Text>
          <FlatList
            data={timeSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item) => item}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.timeGrid}
          />
        </View>

        {/* Number of Guests */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.booking.guests}
          </Text>
          <View style={styles.guestCounterRow}>
            <GuestCounter value={guests} onChange={setGuests} min={1} max={20} />
            <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>
              {guests} {guests === 1 ? strings.common.guest : strings.common.guests}
            </Text>
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {strings.booking.specialRequests}
          </Text>
          <TextInput
            style={[
              styles.textArea,
              Typography.body,
              {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder={strings.booking.specialRequestsPlaceholder}
            placeholderTextColor={colors.inputPlaceholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}>
        <Button
          title={strings.booking.confirm}
          onPress={handleConfirm}
          fullWidth
          disabled={!selectedTime}
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
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  venueThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  venueHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dateScroll: {
    paddingTop: Spacing.sm,
  },
  timeGrid: {
    paddingTop: Spacing.sm,
  },
  guestCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    minHeight: 100,
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
