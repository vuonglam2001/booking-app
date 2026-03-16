import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography, FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatShortDate(date: Date, language: string): string {
  const dayNames = language === 'vi' ? DAY_NAMES_VI : DAY_NAMES_EN;
  const day = dayNames[date.getDay()];
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day} ${d}/${m}`;
}

interface BookingFilterBarProps {
  onSearch: () => void;
  onFilter: () => void;
}

export function BookingFilterBar({ onSearch, onFilter }: BookingFilterBarProps) {
  const { mode } = useAppMode();
  const { language, strings } = useLanguage();
  const colors = ThemeColors[mode];

  const [guests, setGuests] = useState(2);
  const [date] = useState(() => new Date());
  const [time] = useState('19:00');

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Row 1: Guests · Date · Time */}
      <Pressable
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={onFilter}>
        <View style={styles.rowContent}>
          <MaterialIcons name="group" size={18} color={colors.textSecondary} />
          <Text style={[styles.rowText, { color: colors.text }]}>
            {guests}
          </Text>
          <Text style={[styles.dot, { color: colors.textTertiary }]}>&middot;</Text>
          <Text style={[styles.rowText, { color: colors.text }]}>
            {formatShortDate(date, language)}
          </Text>
          <Text style={[styles.dot, { color: colors.textTertiary }]}>&middot;</Text>
          <Text style={[styles.rowText, { color: colors.text }]}>
            {time}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
      </Pressable>

      {/* Row 2: Location */}
      <Pressable
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={onFilter}>
        <View style={styles.rowContent}>
          <MaterialIcons name="place" size={18} color={colors.textSecondary} />
          <Text style={[styles.rowText, { color: colors.text }]} numberOfLines={1}>
            Ho Chi Minh
          </Text>
          <Text style={[styles.locationSub, { color: colors.textSecondary }]}>
            ({strings.home.allDistricts})
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
      </Pressable>

      {/* Search Button */}
      <Pressable
        style={[styles.searchButton, { backgroundColor: colors.primary }]}
        onPress={onSearch}>
        <Text style={[styles.searchText, { color: colors.primaryForeground }]}>
          {mode === 'dining' ? strings.home.findRestaurants : strings.home.findVenues}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  rowText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  dot: {
    fontSize: 16,
    fontFamily: FontFamily.sansMedium,
  },
  locationSub: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
  },
  searchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 4,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.sm,
    borderRadius: 12,
  },
  searchText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 15,
  },
});
