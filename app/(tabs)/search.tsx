import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';

import { SearchBar } from '@/components/ui/search-bar';
import { VenueListItem } from '@/components/ui/venue-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useVenues } from '@/hooks/use-venues';
import { getVenuesByMode } from '@/data';
import type { CuisineType, MusicType, Venue } from '@/types';

// Full 24h time slots, every 30 minutes
const ALL_TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  ALL_TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
  ALL_TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:30`);
}

// Peak hours by mode
const DINING_PEAK_HOURS = ['11:30', '12:00', '12:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
const NIGHTLIFE_PEAK_HOURS = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SearchScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const params = useLocalSearchParams<{
    guests?: string;
    time?: string;
    district?: string;
    rating?: string;
    cuisines?: string;
    music?: string;
  }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState(2);
  const [guestInput, setGuestInput] = useState('2');
  const [time, setTime] = useState('19:00');
  const [district, setDistrict] = useState(strings.home.allDistricts);
  const [openDropdown, setOpenDropdown] = useState<'guests' | 'time' | 'district' | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [cuisineFilter, setCuisineFilter] = useState<CuisineType | undefined>(undefined);
  const [musicFilter, setMusicFilter] = useState<MusicType | undefined>(undefined);

  // Apply filters from filter page params
  useEffect(() => {
    if (params.guests) {
      const g = parseInt(params.guests, 10);
      if (!isNaN(g) && g >= 1) { setGuests(g); setGuestInput(String(g)); }
    }
    if (params.time) setTime(params.time);
    if (params.district) setDistrict(params.district);
    if (params.rating) {
      const r = parseFloat(params.rating);
      if (!isNaN(r)) setRatingFilter(r);
    }
    if (params.cuisines) setCuisineFilter(params.cuisines.split(',')[0] as CuisineType);
    if (params.music) setMusicFilter(params.music.split(',')[0] as MusicType);
  }, [params.guests, params.time, params.district, params.rating, params.cuisines, params.music]);

  const peakHours = mode === 'dining' ? DINING_PEAK_HOURS : NIGHTLIFE_PEAK_HOURS;

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  // Build district options from real venue data, sorted by proximity to user
  const allVenues = useMemo(() => getVenuesByMode(mode), [mode]);

  const districtOptions = useMemo(() => {
    // Extract unique districts from venue data
    const uniqueDistricts = [...new Set(allVenues.map((v) => v.district))];

    if (!userLocation) return [strings.home.allDistricts, ...uniqueDistricts.sort()];

    // Calculate average distance to each district's venues
    const withDistance = uniqueDistricts.map((d) => {
      const districtVenues = allVenues.filter((v) => v.district === d);
      const avgLat = districtVenues.reduce((s, v) => s + v.coordinates.latitude, 0) / districtVenues.length;
      const avgLng = districtVenues.reduce((s, v) => s + v.coordinates.longitude, 0) / districtVenues.length;
      const dist = haversineKm(userLocation.latitude, userLocation.longitude, avgLat, avgLng);
      return { name: d, dist };
    });

    withDistance.sort((a, b) => a.dist - b.dist);
    return [strings.home.allDistricts, ...withDistance.map((d) => d.name)];
  }, [allVenues, userLocation, strings.home.allDistricts]);

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

  const districtFilterValue = district !== strings.home.allDistricts ? district : undefined;
  const venues = useVenues({
    mode,
    searchQuery,
    districtFilter: districtFilterValue,
    ratingFilter: ratingFilter ?? undefined,
    cuisineFilter: mode === 'dining' ? cuisineFilter : undefined,
    musicFilter: mode === 'nightlife' ? musicFilter : undefined,
  });

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
                backgroundColor: district !== strings.home.allDistricts || openDropdown === 'district'
                  ? colors.primary : 'transparent',
                borderColor: district !== strings.home.allDistricts || openDropdown === 'district'
                  ? colors.primary : colors.border,
              },
            ]}>
            <MaterialIcons
              name="place"
              size={16}
              color={district !== strings.home.allDistricts || openDropdown === 'district'
                ? colors.primaryForeground : colors.textSecondary}
            />
            <Text
              style={[
                styles.chipText,
                { color: district !== strings.home.allDistricts || openDropdown === 'district'
                  ? colors.primaryForeground : colors.text },
              ]}>
              {district}
            </Text>
          </Pressable>

          {/* Map view button */}
          <Pressable
            onPress={() => {
              setOpenDropdown(null);
              router.push('/nearby-map');
            }}
            style={[
              styles.iconChip,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}>
            <MaterialIcons name="map" size={18} color={colors.primaryForeground} />
          </Pressable>

          {/* Filter tune button */}
          <Pressable
            onPress={() => {
              setOpenDropdown(null);
              router.push({
                pathname: '/filter',
                params: { guests: String(guests), time, district },
              });
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
          <View style={styles.guestPickerRow}>
            <Pressable
              onPress={() => {
                const next = Math.max(1, guests - 1);
                setGuests(next);
                setGuestInput(String(next));
              }}
              style={[
                styles.guestBtn,
                {
                  backgroundColor: guests <= 1 ? colors.inputBackground : colors.primary + '15',
                  borderColor: guests <= 1 ? colors.border : colors.primary,
                },
              ]}>
              <MaterialIcons name="remove" size={20} color={guests <= 1 ? colors.textTertiary : colors.primary} />
            </Pressable>

            <View style={styles.guestValueWrap}>
              <TextInput
                style={[styles.guestValueInput, { color: colors.text }]}
                value={guestInput}
                onChangeText={handleGuestInputChange}
                onSubmitEditing={handleGuestInputSubmit}
                onBlur={handleGuestInputSubmit}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={[styles.guestLabel, { color: colors.textSecondary }]}>
                {guests === 1 ? strings.common.guest : strings.common.guests}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                const next = Math.min(99, guests + 1);
                setGuests(next);
                setGuestInput(String(next));
              }}
              style={[
                styles.guestBtn,
                { backgroundColor: colors.primary + '15', borderColor: colors.primary },
              ]}>
              <MaterialIcons name="add" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      )}

      {openDropdown === 'time' && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
            {peakHours.map((t) => (
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
            {/* More time button */}
            <Pressable
              onPress={() => { setOpenDropdown(null); setShowTimeModal(true); }}
              style={[styles.moreTimeBtn, { borderColor: colors.border }]}>
              <MaterialIcons name="more-horiz" size={18} color={colors.textSecondary} />
              <Text style={[styles.moreTimeText, { color: colors.textSecondary }]}>More</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* Time Picker Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimeModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings.booking.selectTime}
              </Text>
              <Pressable onPress={() => setShowTimeModal(false)} hitSlop={8}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Peak hours section */}
              <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                {mode === 'dining' ? 'Peak Hours' : 'Popular Hours'}
              </Text>
              <View style={styles.modalTimeGrid}>
                {peakHours.map((t) => (
                  <Pressable
                    key={`peak-${t}`}
                    onPress={() => { setTime(t); setShowTimeModal(false); }}
                    style={[
                      styles.modalTimeItem,
                      {
                        backgroundColor: t === time ? colors.primary : 'transparent',
                        borderColor: t === time ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[styles.modalTimeText, { color: t === time ? colors.primaryForeground : colors.text }]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* All times section */}
              <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                All Times
              </Text>
              <View style={styles.modalTimeGrid}>
                {ALL_TIME_OPTIONS.map((t) => (
                  <Pressable
                    key={`all-${t}`}
                    onPress={() => { setTime(t); setShowTimeModal(false); }}
                    style={[
                      styles.modalTimeItem,
                      {
                        backgroundColor: t === time ? colors.primary : 'transparent',
                        borderColor: t === time ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[styles.modalTimeText, { color: t === time ? colors.primaryForeground : colors.text }]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {openDropdown === 'district' && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
            {districtOptions.map((d) => (
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
  guestPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.lg,
  },
  guestBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestValueWrap: {
    alignItems: 'center',
    minWidth: 60,
  },
  guestValueInput: {
    fontFamily: FontFamily.displayBold,
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    padding: 0,
    minWidth: 50,
  },
  guestLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
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
  moreTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  moreTimeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  modalSectionLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  modalTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  modalTimeItem: {
    paddingVertical: Spacing.sm + 2,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    flexBasis: '30%',
    flexGrow: 1,
    maxWidth: '33%',
  },
  modalTimeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
});
