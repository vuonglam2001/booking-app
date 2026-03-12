import type { AppMode, Venue } from '@/types';

import restaurantsData from './restaurants.json';
import nightlifeData from './nightlife.json';

const restaurants: Venue[] = restaurantsData as Venue[];
const nightlife: Venue[] = nightlifeData as Venue[];

export function getVenuesByMode(mode: AppMode): Venue[] {
  return mode === 'dining' ? restaurants : nightlife;
}

export function getVenueById(id: string): Venue | undefined {
  return [...restaurants, ...nightlife].find((v) => v.id === id);
}

export function getAllVenues(): Venue[] {
  return [...restaurants, ...nightlife];
}
