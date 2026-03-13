import React, { useState, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { SearchBar } from '@/components/ui/search-bar';
import { VenueListItem } from '@/components/ui/venue-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useVenues } from '@/hooks/use-venues';
import type { Venue } from '@/types';

// Full 24h time slots, every 30 minutes
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:30`);
}
const DISTRICT_OPTIONS = ['HCM', 'D1', 'D2', 'D3', 'D7', 'Thao Dien', 'Binh Thanh'];

export default function SearchScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];

  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState(2);
  const [guestInput, setGuestInput] = useState('2');
  const [time, setTime] = useState('19:00');
  const [district, setDistrict] = useState('HCM');
  const [openDropdown, setOpenDropdown] = useState<'guests' | 'time' | 'district' | null>(null);

  const handleGuestInputChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setGuestInput(digits);
  };

  const handleGuestInputSubmit = () => {
    const parsed = parseInt(guestInput, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setGuests(Math.min(parsed, 99));
      setGuestInput(String(Math.min(parsed, 99)));
    } else {
      setGuestInput(String(guests));
    }
    setOpenDropdown(null);
  };

  const venues = useVenues({ mode, searchQuery });

  const toggleDropdown = (type: 'guests' | 'time' | 'district') => {
    if (type === 'guests') setGuestInput(String(guests));
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const renderVenue = useCallback(
    ({ item }: { item: Venue }) => (
      <VenueListItem
        venue={item}
        onPress={() => router.push({ pathname: '/venue/[id]', params: { id: item.id } })}
      />
    ),
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={strings.search.placeholder}
          onFocus={() => setOpenDropdown(null)}
        />
      </View>

      {/* Filter Chips Row */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {/* Guests */}
          <Pressable
            onPress={() => toggleDropdown('guests')}
            style={[
              styles.chip,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}>
            <MaterialIcons name="group" size={16} color={colors.primaryForeground} />
            <Text style={[styles.chipText, { color: colors.primaryForeground }]}>
              {guests} {guests === 1 ? strings.common.guest : strings.common.guests}
            </Text>
          </Pressable>

          {/* Time */}
          <Pressable
            onPress={() => toggleDropdown('time')}
            style={[
              styles.chip,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}>
            <MaterialIcons name="schedule" size={16} color={colors.primaryForeground} />
            <Text style={[styles.chipText, { color: colors.primaryForeground }]}>
              {time}
            </Text>
          </Pressable>

          {/* District */}
          <Pressable
            onPress={() => toggleDropdown('district')}
            style={[
              styles.chip,
              {
                backgroundColor: openDropdown === 'district' ? colors.primary : 'transparent',
                borderColor: openDropdown === 'district' ? colors.primary : colors.border,
              },
            ]}>
            <MaterialIcons
              name="place"
              size={16}
              color={openDropdown === 'district' ? colors.primaryForeground : colors.textSecondary}
            />
            <Text
              style={[
                styles.chipText,
                { color: openDropdown === 'district' ? colors.primaryForeground : colors.text },
              ]}>
              {district}
            </Text>
          </Pressable>

          {/* Filter tune button */}
          <Pressable
            onPress={() => {
              setOpenDropdown(null);
              router.push('/filter');
            }}
            style={[
              styles.iconChip,
              { backgroundColor: 'transparent', borderColor: colors.border },
            ]}>
            <MaterialIcons name="tune" size={18} color={colors.textSecondary} />
          </Pressable>
        </ScrollView>
      </View>

      {/* Dropdown Panels */}
      {openDropdown === 'guests' && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <Pressable
                key={g}
                onPress={() => { setGuests(g); setGuestInput(String(g)); setOpenDropdown(null); }}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor: g === guests ? colors.primary : 'transparent',
                    borderColor: g === guests ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.dropdownText, { color: g === guests ? colors.primaryForeground : colors.text }]}>
                  {g}
                </Text>
              </Pressable>
            ))}
            {/* Custom input */}
            <View style={styles.guestInputWrap}>
              <TextInput
                style={[styles.guestInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
                value={guestInput}
                onChangeText={handleGuestInputChange}
                onSubmitEditing={handleGuestInputSubmit}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
                placeholder="#"
                placeholderTextColor={colors.inputPlaceholder}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {openDropdown === 'time' && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
            {TIME_OPTIONS.map((t) => (
              <Pressable
                key={t}
                onPress={() => { setTime(t); setOpenDropdown(null); }}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor: t === time ? colors.primary : 'transparent',
                    borderColor: t === time ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.dropdownText, { color: t === time ? colors.primaryForeground : colors.text }]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {openDropdown === 'district' && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
            {DISTRICT_OPTIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => { setDistrict(d); setOpenDropdown(null); }}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor: d === district ? colors.primary : 'transparent',
                    borderColor: d === district ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.dropdownText, { color: d === district ? colors.primaryForeground : colors.text }]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Venue List */}
      {venues.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title={strings.search.noResults}
          description={strings.search.noResultsDesc}
        />
      ) : (
        <FlatList
          data={venues}
          renderItem={renderVenue}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setOpenDropdown(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  filtersContainer: {
    paddingBottom: Spacing.sm,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  iconChip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  dropdown: {
    marginHorizontal: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  guestInputWrap: {
    justifyContent: 'center',
  },
  guestInput: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    width: 48,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  dropdownScroll: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
