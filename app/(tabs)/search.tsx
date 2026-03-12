import React, { useState, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { SearchBar } from '@/components/ui/search-bar';
import { FilterChip } from '@/components/ui/filter-chip';
import { VenueListItem } from '@/components/ui/venue-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useVenues } from '@/hooks/use-venues';
import type { CuisineType, MusicType, PriceLevel, Venue } from '@/types';

const CUISINE_FILTERS: Array<{ label: string; value: CuisineType | null }> = [
  { label: 'All', value: null },
  { label: 'Vietnamese', value: 'vietnamese' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'Italian', value: 'italian' },
  { label: 'French', value: 'french' },
  { label: 'Korean', value: 'korean' },
  { label: 'Fusion', value: 'fusion' },
  { label: 'Seafood', value: 'seafood' },
];

const MUSIC_FILTERS: Array<{ label: string; value: MusicType | null }> = [
  { label: 'All', value: null },
  { label: 'EDM', value: 'edm' },
  { label: 'House', value: 'house' },
  { label: 'Techno', value: 'techno' },
  { label: 'Hip Hop', value: 'hiphop' },
  { label: 'Jazz', value: 'jazz' },
  { label: 'Live', value: 'live' },
  { label: 'R&B', value: 'rnb' },
];

const PRICE_FILTERS: Array<{ label: string; value: PriceLevel | null }> = [
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
  { label: '$$$$', value: 4 },
];

const RATING_FILTERS: Array<{ label: string; value: number | null }> = [
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

export default function SearchScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];

  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<CuisineType | undefined>(
    undefined
  );
  const [musicFilter, setMusicFilter] = useState<MusicType | undefined>(
    undefined
  );
  const [priceFilter, setPriceFilter] = useState<PriceLevel | undefined>(
    undefined
  );
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined
  );

  const venues = useVenues({
    mode,
    searchQuery,
    cuisineFilter,
    musicFilter,
    priceFilter,
    ratingFilter,
  });

  const typeFilters = mode === 'dining' ? CUISINE_FILTERS : MUSIC_FILTERS;

  const handleTypeFilter = useCallback(
    (value: CuisineType | MusicType | null) => {
      if (mode === 'dining') {
        setCuisineFilter(
          value === cuisineFilter ? undefined : (value as CuisineType | undefined) ?? undefined
        );
      } else {
        setMusicFilter(
          value === musicFilter ? undefined : (value as MusicType | undefined) ?? undefined
        );
      }
    },
    [mode, cuisineFilter, musicFilter]
  );

  const handlePriceFilter = useCallback(
    (value: PriceLevel | null) => {
      setPriceFilter(value === priceFilter ? undefined : value ?? undefined);
    },
    [priceFilter]
  );

  const handleRatingFilter = useCallback(
    (value: number | null) => {
      setRatingFilter(value === ratingFilter ? undefined : value ?? undefined);
    },
    [ratingFilter]
  );

  const renderVenue = useCallback(
    ({ item }: { item: Venue }) => (
      <VenueListItem
        venue={item}
        onPress={() => router.push({ pathname: '/venue/[id]', params: { id: item.id } })}
      />
    ),
    []
  );

  const activeTypeFilter =
    mode === 'dining' ? cuisineFilter : musicFilter;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={strings.search.placeholder}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {typeFilters.map((filter) => (
            <FilterChip
              key={filter.label}
              label={filter.label}
              selected={
                filter.value === null
                  ? activeTypeFilter === undefined
                  : activeTypeFilter === filter.value
              }
              onPress={() => handleTypeFilter(filter.value)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {PRICE_FILTERS.map((filter) => (
            <FilterChip
              key={filter.label}
              label={filter.label}
              selected={priceFilter === filter.value}
              onPress={() => handlePriceFilter(filter.value)}
            />
          ))}
          {RATING_FILTERS.map((filter) => (
            <FilterChip
              key={filter.label}
              label={filter.label}
              selected={ratingFilter === filter.value}
              onPress={() => handleRatingFilter(filter.value)}
            />
          ))}
        </ScrollView>
      </View>

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
    paddingVertical: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
