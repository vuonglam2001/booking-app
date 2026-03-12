import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { HomeHeader } from '@/components/ui/home-header';
import { SearchBar } from '@/components/ui/search-bar';
import { BookingFilterBar } from '@/components/ui/booking-filter-bar';
import { CategoryTabs, type CategoryKey } from '@/components/ui/category-tabs';
import { SectionHeader } from '@/components/ui/section-header';
import { TrendingCard } from '@/components/ui/trending-card';
import { NearYouItem } from '@/components/ui/near-you-item';
import { Carousel } from '@/components/ui/carousel';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { useAppMode } from '@/hooks/use-app-mode';
import { getVenuesByMode } from '@/data';
import type { Venue } from '@/types';

export default function HomeScreen() {
  const { mode, setMode } = useAppMode();
  const colors = ThemeColors[mode];
  const [category, setCategory] = useState<CategoryKey>(
    mode === 'nightlife' ? 'nightlife' : 'dining'
  );

  const handleCategoryChange = (key: CategoryKey) => {
    setCategory(key);
    // Switch app mode when selecting dining vs nightlife
    if (key === 'dining' || key === 'cafes') {
      setMode('dining');
    } else {
      setMode('nightlife');
    }
  };

  const venues = useMemo(() => getVenuesByMode(mode), [mode]);

  // Filter venues based on category subcategory
  const filteredVenues = useMemo(() => {
    if (category === 'bars') {
      return venues.filter((v) => v.type === 'bar' || v.type === 'lounge');
    }
    if (category === 'cafes') {
      return venues.filter((v) => v.type === 'cafe');
    }
    return venues;
  }, [venues, category]);

  const trending = useMemo(
    () => [...filteredVenues].sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 8),
    [filteredVenues]
  );

  const nearYou = useMemo(
    () => [...filteredVenues].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 5),
    [filteredVenues]
  );

  const searchPlaceholder =
    mode === 'nightlife'
      ? 'Find a place for tonight...'
      : 'Find a restaurant nearby...';

  const trendingTitle =
    mode === 'nightlife' ? 'Trending Tonight' : 'Trending Now';

  const renderTrendingCard = (item: Venue) => (
    <TrendingCard
      venue={item}
      onPress={() => router.push({ pathname: '/venue/[id]', params: { id: item.id } })}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <HomeHeader
          onNotificationPress={() => {}}
          onAvatarPress={() => router.push('/(tabs)/profile')}
        />

        <View style={styles.searchWrap}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder={searchPlaceholder}
            onFocus={() => router.push('/(tabs)/search')}
          />
        </View>

        <CategoryTabs selected={category} onSelect={handleCategoryChange} />

        <BookingFilterBar
          onSearch={() => router.push('/(tabs)/search')}
          onFilter={() => router.push('/filter')}
        />

        <SectionHeader
          title={trendingTitle}
          onSeeAll={() => router.push('/(tabs)/search')}
        />
        <Carousel
          data={trending}
          renderItem={renderTrendingCard}
          keyExtractor={(item) => item.id}
        />

        <SectionHeader
          title="Near You"
          onSeeAll={() => router.push('/(tabs)/search')}
        />
        <View style={styles.nearYouList}>
          {nearYou.map((venue) => (
            <NearYouItem
              key={venue.id}
              venue={venue}
              onPress={() => router.push({ pathname: '/venue/[id]', params: { id: venue.id } })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  searchWrap: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  nearYouList: {
    paddingHorizontal: Spacing.md,
  },
});
