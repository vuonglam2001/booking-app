# Spotly — Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** 2026-03-12
**Platform:** Mobile (iOS & Android) via React Native / Expo
**App Name:** Spotly

---

## 1. Overview

Spotly is a fast, modern reservation platform for restaurants and nightlife venues. It connects the **Discovery → Decision → Booking** journey into a seamless experience that takes seconds, not minutes.

The app targets two distinct verticals:
- **Restaurant Booking** — Restaurants, cafes, fine dining
- **Nightlife Booking** — Bars, clubs, lounges

---

## 2. Problem Statement

Table reservations today are inefficient and fragmented. Venues rely on phone calls, manual bookings, social media messages, and multiple disconnected platforms.

### Customer Pain Points
- Hard to find available tables quickly
- Must call restaurants to confirm availability
- Difficult to compare venues side-by-side
- No instant booking after discovering a place from social media or influencers

### Venue Pain Points
- Manual booking management is error-prone
- Missed reservations and no-shows
- No customer data tracking
- No connection between marketing (social/KOL) and actual bookings

**Result:** The discovery → booking journey is slow and disconnected.

---

## 3. Solution

Spotly bridges the gap between discovery and booking by providing:

- Instant venue discovery with smart filters
- Ultra-fast booking (under 10 seconds)
- Direct booking from influencer/KOL content
- Separate optimized experiences for restaurant and nightlife bookings

---

## 4. Target Users

| User Type | Description |
|-----------|-------------|
| **Diners** | People looking to book restaurant tables for casual or fine dining |
| **Nightlife Goers** | People looking for bars, clubs, lounges, and events |
| **Restaurant Owners/Managers** | Venue operators managing tables, availability, and bookings |
| **Nightlife Venue Operators** | Club/bar operators managing VIP tables, events, and packages |
| **Influencers/KOLs** | Content creators who recommend venues and drive bookings |

---

## 5. Core Features

### 5.1 Smart Venue Discovery

Users explore venues through curated and personalized sections:

| Section | Description |
|---------|-------------|
| **Trending Tonight** | Most booked/viewed venues in real-time |
| **Top Rated** | Highest-rated venues by user reviews |
| **Near You** | Location-based venue suggestions |
| **KOL Recommendations** | Venues featured by influencers/food bloggers |

**Technical Requirements:**
- Geolocation services (expo-location) for proximity-based results
- Trending algorithm based on booking volume + view count within a rolling time window
- Content feed integration for KOL recommendations

### 5.2 Advanced Filtering System

#### Restaurant Filters
- Cuisine type (Japanese, Italian, Vietnamese, etc.)
- Price range ($ / $$ / $$$ / $$$$)
- Rating (minimum star threshold)
- Distance from current location
- Available booking time slots
- Dietary preferences (vegetarian, vegan, halal, gluten-free)

#### Nightlife Filters
- Music type (EDM, Hip-hop, House, Live band, etc.)
- Crowd level (real-time occupancy indicator)
- Events tonight (DJ sets, party nights, special shows)
- Table type (VIP, lounge, bar seat, standing)
- Drink packages available

**Technical Requirements:**
- Multi-faceted filter API with combined query support
- Real-time availability data from venue systems
- Filter state persistence per session

### 5.3 Ultra-Fast Booking Flow

The booking process must complete in **under 10 seconds** (4 steps):

```
Step 1: Select venue
Step 2: Select date & time
Step 3: Choose number of guests
Step 4: Confirm booking
```

**Optional add-ons (do not block core flow):**
- Pre-order drinks/food
- Select specific table type
- Add special requests (birthday, anniversary, dietary needs)

**Technical Requirements:**
- Real-time availability checking via WebSocket or polling
- Optimistic UI updates for instant feedback
- Booking confirmation with unique reservation ID
- Push notification for confirmation + reminder

### 5.4 Social Media & KOL Integration

Spotly connects content discovery to instant bookings.

**Flow:**
1. User sees a KOL video/post recommending a venue
2. Post contains a "Book Now" deep link
3. Link opens Spotly booking page for that venue
4. User books a table instantly

**Technical Requirements:**
- Deep linking support (expo-linking) for external platforms
- Universal links (iOS) and App Links (Android)
- KOL referral tracking (attribution analytics)
- Embeddable booking widget/link for social media bios

### 5.5 Nightlife-Specific Features

#### Table Packages
Pre-configured packages for nightlife venues:
```
Example — VIP Table Package:
- 1 bottle (choice of spirit)
- 4 guests included
- Reserved VIP table
- Priority entry
```

#### Event Booking
Users can discover and book for specific events:
- DJ events
- Party nights / themed nights
- Special shows and performances

#### Real-Time Crowd Indicators
Live status display for each venue:

| Status | Meaning |
|--------|---------|
| Available | Plenty of space |
| Busy | Filling up, book soon |
| Full | No availability |

**Technical Requirements:**
- Venue operators update crowd status via partner dashboard (or IoT integration in future)
- Status reflected in real-time on user-facing app
- Push notifications for "venue now available" alerts (opt-in)

---

## 6. AI Features

### 6.1 AI Restaurant Recommendation
Natural language venue search:
- Input: *"Find a romantic dinner place near me under $50"*
- Output: Matching restaurants with available booking times

### 6.2 AI Nightlife Match
Context-aware nightlife suggestions:
- Input: *"Where should we go tonight for EDM music and VIP tables?"*
- Output: Matching clubs, available tables, and event highlights

### 6.3 AI Booking Assistant
Proactive booking intelligence:
- Suggest optimal booking times based on historical data
- Recommend popular tables/seating arrangements
- Predict busy hours and advise best times to visit

**Technical Requirements:**
- LLM integration for natural language query parsing
- Recommendation engine using collaborative filtering + content-based filtering
- Venue/time popularity prediction model

---

## 7. User Journey

### 7.1 Discovery
User opens the app and sees:
- Trending places
- KOL recommendations
- Nearby venues
- Personalized suggestions (returning users)

### 7.2 Exploration
User applies filters:
- Cuisine / music type
- Price range
- Availability
- Venue details, photos, reviews

### 7.3 Booking
User selects:
- Date & time
- Number of guests
- Optional add-ons
- Confirms instantly

### 7.4 Post-Booking
User receives:
- Booking confirmation screen
- Push notification with reservation details
- Google Maps / Apple Maps directions
- Reminder notification (configurable: 1hr / 2hr / 1 day before)

---

## 8. Information Architecture & Screen Map

```
App Root
├── Auth
│   ├── Welcome / Onboarding
│   ├── Sign In (Phone / Email / Social)
│   └── Sign Up
│
├── Main Tabs
│   ├── Home (Discovery)
│   │   ├── Trending Section
│   │   ├── Near You Section
│   │   ├── Top Rated Section
│   │   ├── KOL Picks Section
│   │   └── AI Search Bar
│   │
│   ├── Search / Explore
│   │   ├── Filter Panel
│   │   ├── Search Results (List / Map View)
│   │   └── Category Browsing
│   │
│   ├── Bookings
│   │   ├── Upcoming Reservations
│   │   ├── Past Reservations
│   │   └── Booking Detail
│   │
│   └── Profile
│       ├── Account Settings
│       ├── Favorites / Saved Venues
│       ├── Notification Preferences
│       └── Payment Methods
│
├── Venue Detail (Modal / Stack)
│   ├── Photos & Gallery
│   ├── Info (Hours, Location, Menu)
│   ├── Reviews & Ratings
│   ├── Available Time Slots
│   └── Book Now CTA
│
├── Booking Flow (Stack)
│   ├── Select Date & Time
│   ├── Select Guests & Table Type
│   ├── Add-ons (Optional)
│   ├── Review & Confirm
│   └── Booking Confirmation
│
└── Nightlife Mode
    ├── Events Tonight
    ├── Crowd Status Dashboard
    └── Table Package Selection
```

---

## 9. Technical Architecture

### 9.1 Frontend (This Repository)

| Component | Technology |
|-----------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | expo-router (file-based routing) |
| State Management | Zustand (recommended) or React Context |
| UI Components | Custom components + react-native-reanimated for animations |
| Networking | Axios or fetch with React Query / TanStack Query |
| Maps | react-native-maps + Google Maps / Apple Maps |
| Push Notifications | expo-notifications |
| Location | expo-location |
| Image Handling | expo-image (already installed) |
| Deep Linking | expo-linking (already installed) |
| Auth | expo-auth-session or Firebase Auth |
| Payments | Stripe React Native SDK |

### 9.2 Backend (Separate Repository — To Be Built)

| Component | Technology |
|-----------|-----------|
| API | Node.js + Express / Fastify or Supabase |
| Database | PostgreSQL |
| Real-time | WebSocket (Socket.io) or Supabase Realtime |
| Search | Elasticsearch or PostgreSQL full-text search |
| File Storage | AWS S3 or Supabase Storage |
| Auth | JWT + OAuth 2.0 |
| AI/LLM | Claude API or OpenAI API |
| Push | Firebase Cloud Messaging (FCM) + APNs |

### 9.3 Key Data Models

```
Venue
├── id, name, slug
├── type (restaurant | bar | club | lounge | cafe)
├── description, photos[]
├── location (lat, lng, address, city)
├── cuisine[] / music_type[]
├── price_range, rating
├── operating_hours
├── amenities[]
└── is_active

Table
├── id, venue_id
├── type (standard | vip | lounge | bar_seat)
├── capacity (min_guests, max_guests)
├── location_description
└── is_available

Reservation
├── id, user_id, venue_id, table_id
├── date, time_slot
├── guest_count
├── status (pending | confirmed | cancelled | completed | no_show)
├── special_requests
├── add_ons[] (pre-orders, packages)
├── kol_referral_id (nullable)
└── created_at, updated_at

User
├── id, name, email, phone
├── avatar_url
├── preferences (cuisine[], dietary[], location)
├── favorites[] (venue_ids)
└── notification_settings

Event (Nightlife)
├── id, venue_id
├── title, description
├── date, start_time, end_time
├── dj / performer
├── cover_charge
├── ticket_url
└── crowd_status (available | busy | full)

Package (Nightlife)
├── id, venue_id
├── name, description
├── included_items[] (bottles, mixers, etc.)
├── guest_count
├── price
└── table_type

KOL_Content
├── id, kol_user_id, venue_id
├── platform (instagram | tiktok | youtube)
├── content_url
├── deep_link
├── booking_count (attribution)
└── created_at
```

---

## 10. Implementation Phases

### Phase 1 — Foundation (MVP)
**Goal:** Core booking experience for restaurants

- [ ] Project setup & design system (typography, colors, spacing)
- [ ] Auth flow (sign up / sign in / onboarding)
- [ ] Home screen with discovery sections (Trending, Near You, Top Rated)
- [ ] Venue listing screen with basic filters (cuisine, price, rating, distance)
- [ ] Venue detail screen (photos, info, reviews, availability)
- [ ] Booking flow (date → time → guests → confirm)
- [ ] Booking confirmation & upcoming reservations list
- [ ] Profile screen with basic settings
- [ ] Push notifications for booking confirmation & reminders
- [ ] Backend API: venues, tables, reservations, users CRUD

### Phase 2 — Enhanced Experience
**Goal:** Nightlife support + improved discovery

- [ ] Nightlife mode with separate UI/UX optimizations
- [ ] Event listings and event booking
- [ ] Table packages (VIP, bottle service)
- [ ] Real-time crowd indicators
- [ ] Map view for venue search results
- [ ] Advanced filters (dietary, music type, crowd level, drink packages)
- [ ] Favorites / saved venues
- [ ] Review & rating system
- [ ] Booking history with re-book option

### Phase 3 — Social & KOL Integration
**Goal:** Connect social discovery to bookings

- [ ] Deep linking from Instagram, TikTok, YouTube
- [ ] KOL referral tracking & attribution analytics
- [ ] KOL profile pages within the app
- [ ] "Book from KOL" featured section on home screen
- [ ] Share booking / venue to social media
- [ ] Venue partner dashboard (web — separate project)

### Phase 4 — AI & Intelligence
**Goal:** Smart, personalized experience

- [ ] AI-powered natural language search
- [ ] AI venue recommendations based on preferences & history
- [ ] AI nightlife matching
- [ ] Smart booking suggestions (best time, popular tables)
- [ ] Busy hour predictions
- [ ] Personalized home feed based on behavior

### Phase 5 — Growth & Monetization
**Goal:** Scale and revenue

- [ ] In-app payments (deposits, pre-orders, packages)
- [ ] Loyalty / rewards program
- [ ] Dynamic pricing for peak hours
- [ ] Group booking coordination
- [ ] Multi-language support
- [ ] Venue advertising / promoted listings
- [ ] Analytics dashboard for venue partners

---

## 11. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Booking flow completion | < 10 seconds |
| App launch to interactive | < 2 seconds |
| API response time (p95) | < 300ms |
| Real-time availability refresh | < 1 second |
| Uptime | 99.9% |
| Supported platforms | iOS 15+, Android 10+ |
| Offline support | Cached venue data, queued bookings |
| Accessibility | WCAG 2.1 AA compliance |
| Security | HTTPS, JWT auth, PII encryption at rest |

---

## 12. Success Metrics

| Metric | Description |
|--------|-------------|
| **Booking Conversion Rate** | % of users who complete a booking after viewing a venue |
| **Time to Book** | Average seconds from venue selection to confirmation |
| **KOL Conversion Rate** | % of deep link opens that result in a booking |
| **DAU / MAU** | Daily and monthly active users |
| **Retention Rate** | 7-day and 30-day retention |
| **Venue Fill Rate** | % of available tables booked through Spotly |
| **NPS** | Net Promoter Score from user surveys |

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low venue adoption | No supply → no bookings | Start with a curated list of partner venues; offer free onboarding |
| Real-time availability inaccuracy | Bad UX, double bookings | Webhook-based sync with venue POS; manual override dashboard |
| KOL link abuse / spam | Trust erosion | Rate limiting, verified KOL program, fraud detection |
| Competition (OpenTable, Resy, etc.) | User acquisition cost | Differentiate with nightlife focus, KOL integration, and AI features |
| Scalability under peak load | Slow/failed bookings on weekend nights | Auto-scaling infrastructure, booking queue with guaranteed confirmation |

---

## 14. Open Questions

- [ ] Which payment provider to integrate first? (Stripe, local providers)
- [ ] Should nightlife mode be a separate tab or a toggle within the main experience?
- [ ] What is the venue onboarding process? Self-serve vs. sales-led?
- [ ] How to handle no-shows? Deposit requirement or penalty system?
- [ ] What KOL platforms to prioritize first? (TikTok, Instagram, YouTube)
- [ ] Should AI features use Claude API, OpenAI, or a self-hosted model?

---

## 15. Appendix: Current Tech Stack

The project is already bootstrapped with:

```
- Expo SDK 54 (React Native 0.81)
- expo-router (file-based routing)
- react-native-reanimated (animations)
- react-native-gesture-handler (gestures)
- react-native-safe-area-context
- react-native-screens
- @expo/vector-icons
- TypeScript 5.9
```

The existing file structure uses expo-router's `app/` directory with a tab-based layout. Implementation should build on this foundation.
