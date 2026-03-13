import { Share } from 'react-native';
import * as Linking from 'expo-linking';
import type { PriceLevel } from '@/types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatPriceLevel(level: PriceLevel): string {
  return '$'.repeat(level);
}

/** Compact VND format: 150000 → "150K", 1200000 → "1.2M" */
export function formatVNDCompact(value: number): string {
  if (value >= 1000000) {
    const m = value / 1000000;
    return m % 1 === 0 ? `${m}M` : `${parseFloat(m.toFixed(1))}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${k}K` : `${Math.round(k)}K`;
  }
  return value.toString();
}

/** Format a price range as "150K - 350K" */
export function formatPriceRange(min: number, max: number): string {
  return `${formatVNDCompact(min)} - ${formatVNDCompact(max)}`;
}

/** Generate a deep link URL for a venue */
export function getVenueDeepLink(venueId: string): string {
  return Linking.createURL(`/venue/${venueId}`);
}

/** Share a venue via the native Share sheet */
export async function shareVenue(venueId: string, venueName: string): Promise<void> {
  const url = getVenueDeepLink(venueId);
  await Share.share({
    message: `Check out ${venueName} on BookingApp! ${url}`,
    url, // iOS uses this separately
    title: venueName,
  });
}
