import { getItem, setItem } from '@/utils/storage';
import type { BookingReview } from '@/types';

const STORAGE_KEY = '@spotly/reviews';

export async function getReviews(): Promise<BookingReview[]> {
  return (await getItem<BookingReview[]>(STORAGE_KEY)) ?? [];
}

export async function getReviewByBookingId(bookingId: string): Promise<BookingReview | null> {
  const reviews = await getReviews();
  return reviews.find((r) => r.bookingId === bookingId) ?? null;
}

export async function getReviewsByVenueId(venueId: string): Promise<BookingReview[]> {
  const reviews = await getReviews();
  return reviews.filter((r) => r.restaurantId === venueId);
}

export async function saveReview(review: BookingReview): Promise<void> {
  const reviews = await getReviews();
  reviews.push(review);
  await setItem(STORAGE_KEY, reviews);
}
