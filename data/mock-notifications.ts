import type { AppNotification } from '@/types';

/** Pre-seeded notifications for demo/testing */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'mock-n1',
    type: 'booking_completed',
    bookingId: 'mock-b1',
    titleEn: 'Booking Completed',
    titleVi: 'Đặt chỗ hoàn thành',
    bodyEn: 'Your dining at Nha Hang Ngon is completed. Leave a review!',
    bodyVi: 'Bữa ăn tại Nha Hang Ngon đã hoàn thành. Hãy để lại đánh giá!',
    read: false,
    createdAt: '2026-03-10T21:00:00.000Z',
  },
  {
    id: 'mock-n2',
    type: 'review_prompt',
    bookingId: 'mock-b2',
    titleEn: 'How was your experience?',
    titleVi: 'Trải nghiệm của bạn thế nào?',
    bodyEn: "Rate your visit at Pizza 4P's. Tap to review.",
    bodyVi: "Đánh giá chuyến thăm tại Pizza 4P's. Nhấn để đánh giá.",
    read: false,
    createdAt: '2026-03-11T22:00:00.000Z',
  },
  {
    id: 'mock-n3',
    type: 'booking_completed',
    bookingId: 'mock-b3',
    titleEn: 'Booking Completed',
    titleVi: 'Đặt chỗ hoàn thành',
    bodyEn: 'Your dining at Cuc Gach Quan is completed. Tap to review.',
    bodyVi: 'Bữa ăn tại Cuc Gach Quan đã hoàn thành. Nhấn để đánh giá.',
    read: false,
    createdAt: '2026-03-12T21:30:00.000Z',
  },
];
