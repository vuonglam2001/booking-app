import { getAllVenues } from '@/data';

// ── Part 1: Sensitive content filter ──────────────────────────────

const BANNED_WORDS = [
  'drug', 'drugs', 'cocaine', 'heroin', 'meth', 'weed', 'marijuana',
  'weapon', 'weapons', 'gun', 'guns', 'bomb',
  'kill', 'murder', 'attack', 'terrorist', 'terrorism',
  'hack', 'exploit', 'scam', 'fraud',
  'prostitut', 'escort service',
];

export interface FilterResult {
  blocked: boolean;
  reason?: string;
}

export function filterSensitiveContent(message: string): FilterResult {
  const lower = message.toLowerCase();
  for (const word of BANNED_WORDS) {
    // Match whole-word-ish: check the word appears as a standalone token
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (regex.test(lower)) {
      return {
        blocked: true,
        reason: 'Your message contains inappropriate content. Please keep your requests related to dining and nightlife.',
      };
    }
  }
  return { blocked: false };
}

// ── Part 2: Booking intent parser ─────────────────────────────────

export interface BookingIntent {
  restaurant: string | null;
  venueId: string | null;
  people: number | null;
  time: string | null;
  note: string | null;
}

// ── Part 3: Processed message structure ───────────────────────────

export interface ProcessedMessage {
  intent: 'booking' | 'chat';
  booking?: BookingIntent;
  blocked?: boolean;
  blockReason?: string;
}

// Time parsing
const TIME_PATTERNS: RegExp[] = [
  /(\d{1,2}):(\d{2})\s*(am|pm)/i,
  /(\d{1,2})\s*(am|pm)/i,
  /(\d{1,2}):(\d{2})/,
  /(?:at|lúc|vào)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|giờ|h)?/i,
];

const PEOPLE_PATTERNS: RegExp[] = [
  /(\d+)\s*(?:people|persons?|guests?|pax|người|khách)/i,
  /(?:for|cho)\s+(\d+)/i,
  /(?:table|bàn)\s+(?:for|cho)\s+(\d+)/i,
  /(\d+)\s+(?:of us|chúng tôi)/i,
];

const BOOKING_KEYWORDS = [
  'book', 'reserve', 'reservation', 'table for',
  'đặt bàn', 'đặt chỗ', 'đặt lịch', 'book a table',
];

function parseTime(message: string): string | null {
  const lower = message.toLowerCase();

  for (const pattern of TIME_PATTERNS) {
    const match = lower.match(pattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      // Find minutes: first purely numeric group after hours
      let minutes = 0;
      // Find am/pm: first group that matches am/pm/giờ/h
      let ampm = '';
      for (let g = 2; g < match.length; g++) {
        if (!match[g]) continue;
        const val = match[g].toLowerCase();
        if (/^\d+$/.test(val) && minutes === 0) {
          minutes = parseInt(val, 10);
        } else if (/^(am|pm|giờ|h)$/i.test(val) && !ampm) {
          ampm = val;
        }
      }

      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      if (hours > 23 || minutes > 59) continue;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // Natural language fallback
  if (lower.includes('noon') || lower.includes('trưa')) return '12:00';
  if (lower.includes('evening') || lower.includes('tối nay')) return '19:00';
  if (lower.includes('lunch') || lower.includes('bữa trưa')) return '12:00';
  if (lower.includes('dinner') || lower.includes('bữa tối')) return '19:00';

  return null;
}

function parsePeople(message: string): number | null {
  for (const pattern of PEOPLE_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num <= 50) return num;
    }
  }
  return null;
}

function findVenue(message: string): { name: string; id: string } | null {
  const venues = getAllVenues();
  const lower = message.toLowerCase();

  // Exact name match
  for (const v of venues) {
    if (lower.includes(v.name.toLowerCase())) {
      return { name: v.name, id: v.id };
    }
  }

  // Partial match — more than half of name words present
  for (const v of venues) {
    const nameWords = v.name.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    if (nameWords.length === 0) continue;
    const matchCount = nameWords.filter((w) => lower.includes(w)).length;
    if (matchCount >= Math.ceil(nameWords.length / 2) && matchCount >= 1) {
      return { name: v.name, id: v.id };
    }
  }

  return null;
}

function extractNote(message: string): string | null {
  const lower = message.toLowerCase();

  // Look for allergy/dietary mentions first — highest priority
  const allergyPatterns: RegExp[] = [
    /(?:allerg(?:ic|y)?|allegic|dị ứng)\s+(?:to|with|với)?\s*(.+?)(?:\.|,\s*\d|$)/i,
    /(?:can'?t eat|không ăn được|avoid|tránh)\s+(.+?)(?:\.|,\s*\d|$)/i,
    /(?:no\s+)(\w+(?:\s+\w+)?)(?:\s+please)?(?:\.|,|$)/i,
    /(?:dietary|diet)[:\s]+(.+?)(?:\.|,\s*\d|$)/i,
    /(?:vegetarian|vegan|halal|kosher|gluten.free)/i,
  ];

  for (const pattern of allergyPatterns) {
    const match = lower.match(pattern);
    if (match) {
      // For the last pattern (single keyword), return the whole match
      const note = match[1]?.trim() ?? match[0]?.trim();
      if (note && note.length > 1) {
        // Prefix with context if it's just a food name
        if (/allerg/i.test(lower)) return `Allergic to ${note}`;
        if (/can'?t eat|avoid|tránh|không/i.test(lower)) return `Avoid ${note}`;
        return note;
      }
    }
  }

  // Explicit note/request patterns
  const notePatterns: RegExp[] = [
    /(?:note|ghi chú|yêu cầu)[:\s]+(.+?)(?:\.|,\s*\d|$)/i,
    /(?:special request|yêu cầu đặc biệt)[:\s]+(.+?)(?:\.|$)/i,
    /(?:but\s+(?:i\s+)?(?:am\s+)?)(allerg.*|allegic.*|can'?t.*|no\s+.*)$/i,
  ];

  for (const pattern of notePatterns) {
    const match = message.match(pattern);
    if (match && match[1].trim().length > 2) return match[1].trim();
  }
  return null;
}

export function parseBookingIntent(message: string): BookingIntent | null {
  const lower = message.toLowerCase();

  const hasBookingKeyword = BOOKING_KEYWORDS.some((kw) => lower.includes(kw));
  const venue = findVenue(message);
  const people = parsePeople(message);
  const time = parseTime(message);

  // Need booking keyword + at least venue OR (people + time)
  if (!hasBookingKeyword) return null;
  if (!venue && !people && !time) return null;

  return {
    restaurant: venue?.name ?? null,
    venueId: venue?.id ?? null,
    people,
    time,
    note: extractNote(message),
  };
}

// ── Part 4: Orchestration ─────────────────────────────────────────

export function processUserMessage(message: string): ProcessedMessage {
  // Step 1: Filter sensitive content
  const filterResult = filterSensitiveContent(message);
  if (filterResult.blocked) {
    return {
      intent: 'chat',
      blocked: true,
      blockReason: filterResult.reason,
    };
  }

  // Step 2: Parse booking intent
  const bookingIntent = parseBookingIntent(message);
  if (bookingIntent) {
    return {
      intent: 'booking',
      booking: bookingIntent,
    };
  }

  // Step 3: Normal AI response
  return { intent: 'chat' };
}
