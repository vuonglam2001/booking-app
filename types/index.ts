export type AppMode = 'dining' | 'nightlife';

export type CuisineType =
  | 'vietnamese'
  | 'japanese'
  | 'italian'
  | 'french'
  | 'korean'
  | 'thai'
  | 'chinese'
  | 'indian'
  | 'fusion'
  | 'seafood'
  | 'vegetarian'
  | 'steakhouse'
  | 'pizza'
  | 'cafe';

export type MusicType =
  | 'edm'
  | 'house'
  | 'techno'
  | 'hiphop'
  | 'rnb'
  | 'latin'
  | 'jazz'
  | 'live'
  | 'pop'
  | 'mixed';

export type PriceLevel = 1 | 2 | 3 | 4;

export type VenueType = 'restaurant' | 'bar' | 'club' | 'lounge' | 'rooftop' | 'cafe';

export type ReservationStatus = 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  mode: AppMode;
  description: string;
  address: string;
  district: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  photos: string[];
  rating: number;
  reviewCount: number;
  priceLevel: PriceLevel;
  priceRange: {
    min: number;
    max: number;
  };
  cuisineTypes?: CuisineType[];
  musicTypes?: MusicType[];
  hours: {
    open: string;
    close: string;
  };
  tags: string[];
  bookingCount: number;
  isFeatured: boolean;
}

export interface Reservation {
  id: string;
  venueId: string;
  venueName: string;
  venueImage: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface BookingReview {
  bookingId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}
