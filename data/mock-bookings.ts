import type { Reservation } from '@/types';

/** Pre-seeded completed bookings for demo/testing */
export const MOCK_COMPLETED_BOOKINGS: Reservation[] = [
  {
    id: 'mock-b1',
    venueId: 'r1',
    venueName: 'Nha Hang Ngon',
    venueImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    date: '2026-03-10',
    time: '19:00',
    guests: 4,
    status: 'completed',
    createdAt: '2026-03-08T10:00:00.000Z',
  },
  {
    id: 'mock-b2',
    venueId: 'r2',
    venueName: "Pizza 4P's",
    venueImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    date: '2026-03-11',
    time: '20:00',
    guests: 2,
    status: 'completed',
    createdAt: '2026-03-09T14:00:00.000Z',
  },
  {
    id: 'mock-b3',
    venueId: 'r3',
    venueName: 'Cuc Gach Quan',
    venueImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    date: '2026-03-12',
    time: '18:30',
    guests: 3,
    specialRequests: 'Window seat please',
    status: 'completed',
    createdAt: '2026-03-10T09:00:00.000Z',
  },
];
