import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
import { useLanguage } from '@/hooks/use-language';
import { getVenuesByMode } from '@/data';
import type { Venue } from '@/types';

export default function HomeScreen() {
  const { mode, setMode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const [category, setCategory] = useState<CategoryKey>(
    mode === 'nightlife' ? 'nightlife' : 'dining'
  );

  const handleCategoryChange = (key: CategoryKey) => {
    setCategory(key);
    // Switch app mode when selecting dining vs nightlife
    if (key === 'dining') {
      setMode('dining');
    } else {
      setMode('nightlife');
    }
  };

  const venues = useMemo(() => getVenuesByMode(mode), [mode]);

  const filteredVenues = useMemo(() => venues, [venues]);

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
      ? strings.home.searchPlaceholderNightlife
      : strings.home.searchPlaceholder;

  const trendingTitle =
    mode === 'nightlife' ? strings.home.trendingNightlife : strings.home.trending;

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
          title={strings.home.nearYou}
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

      {/* AI Assistant FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/ai-assistant')}>
        <MaterialIcons name="auto-awesome" size={22} color={colors.primaryForeground} />
        <Text style={[styles.fabText, { color: colors.primaryForeground }]}>AI</Text>
      </Pressable>
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
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 14,
  },
});
