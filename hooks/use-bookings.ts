import { useContext } from 'react';

import { BookingsContext } from '@/contexts/bookings-context';

export function useBookings() {
  return useContext(BookingsContext);
}
