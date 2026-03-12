import { useMemo } from 'react';

import { getVenuesByMode } from '@/data';
import type { AppMode, CuisineType, MusicType, PriceLevel, Venue } from '@/types';

interface UseVenuesOptions {
  mode: AppMode;
  searchQuery?: string;
  cuisineFilter?: CuisineType;
  musicFilter?: MusicType;
  priceFilter?: PriceLevel;
  ratingFilter?: number;
}

export function useVenues({
  mode,
  searchQuery,
  cuisineFilter,
  musicFilter,
  priceFilter,
  ratingFilter,
}: UseVenuesOptions): Venue[] {
  const venues = useMemo(() => getVenuesByMode(mode), [mode]);

  return useMemo(() => {
    let filtered = venues;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.district.toLowerCase().includes(q)
      );
    }

    if (cuisineFilter) {
      filtered = filtered.filter((v) => v.cuisineTypes?.includes(cuisineFilter));
    }

    if (musicFilter) {
      filtered = filtered.filter((v) => v.musicTypes?.includes(musicFilter));
    }

    if (priceFilter) {
      filtered = filtered.filter((v) => v.priceLevel === priceFilter);
    }

    if (ratingFilter) {
      filtered = filtered.filter((v) => v.rating >= ratingFilter);
    }

    return filtered;
  }, [venues, searchQuery, cuisineFilter, musicFilter, priceFilter, ratingFilter]);
}
