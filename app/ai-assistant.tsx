import React, { useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography, FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useBookings } from '@/hooks/use-bookings';
import { getAllVenues, getVenueById } from '@/data';
import { formatPriceRange } from '@/utils/format';
import { CLAUDE_API_KEY } from '@/constants/api';
import { processUserMessage, type BookingIntent } from '@/utils/ai-message-processor';
import type { Reservation, Venue } from '@/types';

interface Recommendation {
  venueId: string;
  venue: string;
  reason: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  recommendations?: Recommendation[];
  bookingIntent?: BookingIntent;
  bookingConfirmed?: boolean;
}

// ── Keyword map for local matching ──────────────────────────────
const KEYWORD_MAP: Record<string, string[]> = {
  vietnamese: ['vietnamese', 'viet', 'pho', 'banh', 'com', 'local'],
  japanese: ['japanese', 'sushi', 'omakase', 'japan'],
  italian: ['italian', 'pizza', 'pasta'],
  french: ['french', 'bistro'],
  korean: ['korean', 'bbq', 'kbbq'],
  fusion: ['fusion', 'modern', 'creative'],
  seafood: ['seafood', 'fish', 'shrimp'],
  vegetarian: ['vegetarian', 'vegan', 'plant'],
  cafe: ['cafe', 'coffee', 'brunch'],
  bar: ['bar', 'drinks', 'cocktail', 'cocktails'],
  club: ['club', 'dance', 'dancing', 'party'],
  lounge: ['lounge', 'chill', 'relax'],
  rooftop: ['rooftop', 'roof', 'view', 'skyline'],
  edm: ['edm', 'electronic', 'dj'],
  house: ['house', 'deep house'],
  jazz: ['jazz', 'live music', 'live'],
  hiphop: ['hiphop', 'hip hop', 'rap'],
  romantic: ['romantic', 'date', 'couple', 'anniversary'],
  cheap: ['cheap', 'budget', 'affordable', 'inexpensive'],
  fancy: ['fancy', 'fine dining', 'upscale', 'luxury', 'premium', 'expensive'],
  nightlife: ['tonight', 'night', 'nightlife', 'evening', 'party'],
  dining: ['dinner', 'lunch', 'eat', 'food', 'restaurant', 'dining', 'meal'],
};

// ── Reason templates ────────────────────────────────────────────
function buildReason(venue: Venue, query: string): string {
  const parts: string[] = [];
  const lower = query.toLowerCase();

  if (venue.rating >= 4.5) parts.push(`Highly rated at ${venue.rating}/5`);
  else parts.push(`Rated ${venue.rating}/5`);

  if (venue.cuisineTypes?.length) {
    parts.push(`serves ${venue.cuisineTypes.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')} cuisine`);
  }
  if (venue.musicTypes?.length) {
    parts.push(`features ${venue.musicTypes.map(m => m.toUpperCase()).join(', ')} music`);
  }

  if (lower.includes('romantic') || lower.includes('date')) {
    if (venue.tags.some(t => ['romantic', 'scenic', 'intimate', 'atmospheric'].includes(t))) {
      parts.push('perfect for a romantic evening');
    }
  }
  if (lower.includes('rooftop') || lower.includes('view')) {
    if (venue.tags.some(t => ['rooftop', 'scenic'].includes(t))) {
      parts.push('great rooftop atmosphere');
    }
  }
  if (venue.isFeatured) parts.push('a featured spot');

  parts.push(`located in ${venue.district}`);
  return parts.join('. ') + '.';
}

// ── Local recommendation engine (instant) ───────────────────────
function getLocalRecommendations(query: string): Recommendation[] {
  const venues = getAllVenues();
  const lower = query.toLowerCase();

  // Score each venue based on keyword matching
  const scored = venues.map((v) => {
    let score = 0;

    // Match against keyword map
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
      const queryMatch = keywords.some((kw) => lower.includes(kw));
      if (!queryMatch) continue;

      // Check venue fields
      const venueText = [
        v.type,
        ...(v.cuisineTypes ?? []),
        ...(v.musicTypes ?? []),
        ...v.tags,
        v.mode,
        v.name.toLowerCase(),
        v.description.toLowerCase(),
      ].join(' ');

      if (category === 'romantic') {
        if (v.tags.some(t => ['romantic', 'scenic', 'intimate', 'atmospheric', 'hidden gem'].includes(t))) score += 5;
        if (v.rating >= 4.4) score += 2;
      } else if (category === 'cheap') {
        if (v.priceLevel <= 2) score += 5;
        if (v.priceLevel === 1) score += 3;
      } else if (category === 'fancy') {
        if (v.priceLevel >= 3) score += 5;
        if (v.priceLevel === 4) score += 3;
      } else if (category === 'nightlife') {
        if (v.mode === 'nightlife') score += 4;
      } else if (category === 'dining') {
        if (v.mode === 'dining') score += 4;
      } else {
        if (venueText.includes(category)) score += 4;
        keywords.forEach((kw) => {
          if (venueText.includes(kw)) score += 2;
        });
      }
    }

    // Direct name match
    if (lower.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(lower)) {
      score += 10;
    }

    // Bonus for rating
    score += v.rating * 0.5;

    // Bonus for popularity
    score += Math.min(v.bookingCount / 500, 2);

    // Bonus for featured
    if (v.isFeatured) score += 1;

    return { venue: v, score };
  });

  // Sort by score desc, take top 3
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  return top.map((item) => ({
    venueId: item.venue.id,
    venue: item.venue.name,
    reason: buildReason(item.venue, query),
  }));
}

// ── Claude API ───────────────────────────────────────────────────
async function askClaude(userMessage: string): Promise<Recommendation[] | null> {
  if (!CLAUDE_API_KEY || (CLAUDE_API_KEY as string) === 'YOUR_API_KEY_HERE') return null;

  try {
    const venues = getAllVenues();
    // Include id so Claude can reference venues directly
    const compact = venues
      .map((v) => `${v.id}|${v.name}|${v.type}|${(v.cuisineTypes ?? v.musicTypes ?? []).slice(0, 2).join(',')}|${v.rating}|${v.district}|${v.tags.slice(0, 3).join(',')}`)
      .join('\n');

    const response = await Promise.race([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-20250514',
          max_tokens: 400,
          system: `You are a venue recommendation assistant for Ho Chi Minh City. Given the user's request and venue list (format: id|name|type|cuisine|rating|district|tags), pick the 3 best matching venues. Reply ONLY with JSON array: [{"venueId":"exact_id","venue":"Name","reason":"Short friendly reason (15 words max)"}]. Use the exact venue id from the list.`,
          messages: [
            {
              role: 'user',
              content: `${userMessage}\n\nVenues:\n${compact}`,
            },
          ],
        }),
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 30000)),
    ]);

    if (!response.ok) return null;

    const data = await response.json();
    const text: string = data.content?.[0]?.text ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;

    const parsed: { venueId?: string; venue: string; reason: string }[] = JSON.parse(match[0]);
    const allVenues = getAllVenues();

    return parsed.map((item) => {
      // Try exact id match first, then fuzzy name match
      let found = item.venueId ? allVenues.find((v) => v.id === item.venueId) : undefined;
      if (!found) {
        const lower = item.venue.toLowerCase();
        found = allVenues.find(
          (v) => v.name.toLowerCase() === lower || v.name.toLowerCase().includes(lower) || lower.includes(v.name.toLowerCase()),
        );
      }
      return { venueId: found?.id ?? '', venue: found?.name ?? item.venue, reason: item.reason };
    });
  } catch {
    return null;
  }
}

// ── Screen ──────────────────────────────────────────────────────
export default function AIAssistantScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { addReservation } = useBookings();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollToEnd = useCallback(
    (delay = 100) => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), delay),
    [],
  );

  const handleConfirmBooking = useCallback(
    (intent: BookingIntent, messageIndex: number) => {
      if (!intent.venueId || !intent.restaurant) return;

      const venue = getVenueById(intent.venueId);
      if (!venue) return;

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const reservation: Reservation = {
        id: `ai-${Date.now()}`,
        venueId: intent.venueId,
        venueName: intent.restaurant,
        venueImage: venue.imageUrl,
        date: dateStr,
        time: intent.time ?? '19:00',
        guests: intent.people ?? 2,
        specialRequests: intent.note ?? undefined,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      addReservation(reservation);

      // Mark the message as confirmed
      setMessages((prev) =>
        prev.map((msg, i) => (i === messageIndex ? { ...msg, bookingConfirmed: true } : msg)),
      );

      // Add confirmation message
      const confirmMsg: ChatMessage = {
        role: 'assistant',
        text: `Your booking at ${intent.restaurant} has been confirmed! ${intent.people ? intent.people + ' guests' : ''} ${intent.time ? 'at ' + intent.time : ''}. Check your bookings for details.`,
      };
      setMessages((prev) => [...prev, confirmMsg]);
      scrollToEnd(200);
    },
    [addReservation, scrollToEnd],
  );

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    // Part 4: Process through message processor
    const processed = processUserMessage(trimmed);

    // Blocked content
    if (processed.blocked) {
      const warningMsg: ChatMessage = {
        role: 'assistant',
        text: processed.blockReason ?? 'Message blocked.',
      };
      setMessages((prev) => [...prev, warningMsg]);
      setLoading(false);
      scrollToEnd(200);
      return;
    }

    // Booking intent detected
    if (processed.intent === 'booking' && processed.booking) {
      const intent = processed.booking;
      const venue = intent.venueId ? getVenueById(intent.venueId) : undefined;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: venue
          ? `I found a booking match! Please confirm the details below:`
          : `I detected a booking request, but couldn't find the restaurant. Could you provide the full name?`,
        bookingIntent: venue ? intent : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
      scrollToEnd(200);
      return;
    }

    // Normal chat — use Claude API + local fallback
    let recs = await askClaude(trimmed);

    if (!recs || recs.length === 0) {
      recs = getLocalRecommendations(trimmed);
    }

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      text: '',
      recommendations: recs,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
    scrollToEnd(200);
  };

  const renderRecommendationCard = (rec: Recommendation, index: number) => {
    const venue = rec.venueId ? getVenueById(rec.venueId) : undefined;

    return (
      <View
        key={`${rec.venueId}-${index}`}
        style={[styles.recCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {venue && (
          <Image
            source={{ uri: venue.imageUrl }}
            style={styles.recImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.recContent}>
          <Text style={[styles.recName, { color: colors.text }]}>{rec.venue}</Text>
          {venue && (
            <View style={styles.recMeta}>
              <MaterialIcons name="star" size={13} color={colors.warning} />
              <Text style={[styles.recMetaText, { color: colors.textSecondary }]}>
                {venue.rating}
              </Text>
              <Text style={[styles.recMetaText, { color: colors.textTertiary }]}>·</Text>
              <Text style={[styles.recMetaText, { color: colors.textSecondary }]}>
                {formatPriceRange(venue.priceRange.min, venue.priceRange.max)}
              </Text>
            </View>
          )}
          <Text style={[styles.recReason, { color: colors.textSecondary }]} numberOfLines={3}>
            {rec.reason}
          </Text>
          {venue && (
            <Pressable
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={() =>
                router.push({ pathname: '/venue/[id]', params: { id: venue.id } })
              }>
              <MaterialIcons name="restaurant" size={16} color={colors.primaryForeground} />
              <Text style={[styles.bookButtonText, { color: colors.primaryForeground }]}>
                {strings.venue.bookNow}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
          <Text style={[Typography.h3, { color: colors.text }]}>AI Assistant</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive">
          {/* Welcome */}
          {messages.length === 0 && (
            <View style={styles.welcome}>
              <View style={[styles.welcomeIcon, { backgroundColor: colors.primary + '15' }]}>
                <MaterialIcons name="auto-awesome" size={32} color={colors.primary} />
              </View>
              <Text style={[Typography.h2, { color: colors.text, textAlign: 'center' }]}>
                Where should we go{'\n'}tonight?
              </Text>
              <Text
                style={[
                  Typography.bodySm,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
                ]}>
                Ask me for restaurant or nightlife recommendations in Ho Chi Minh City
              </Text>

              {/* Quick suggestions */}
              <View style={styles.suggestions}>
                {[
                  'Best rooftop bars tonight?',
                  'Romantic dinner for 2',
                  'Where to eat Vietnamese food?',
                  'Fun club with EDM music',
                ].map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.suggestionChip, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => setInput(s)}>
                    <Text style={[Typography.bodySm, { color: colors.primary }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <View key={i} style={styles.messageWrap}>
              {msg.role === 'user' ? (
                <View style={styles.userRow}>
                  <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
                    <Text style={[Typography.body, { color: colors.primaryForeground }]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.assistantRow}>
                  <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }]}>
                    <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.assistantContent}>
                    {msg.text ? (
                      <Text style={[Typography.body, { color: colors.text }]}>{msg.text}</Text>
                    ) : null}
                    {msg.bookingIntent && !msg.bookingConfirmed && (
                      <View style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
                        {msg.bookingIntent.venueId && (() => {
                          const v = getVenueById(msg.bookingIntent!.venueId!);
                          return v ? (
                            <Image source={{ uri: v.imageUrl }} style={styles.bookingCardImage} resizeMode="cover" />
                          ) : null;
                        })()}
                        <View style={styles.bookingCardBody}>
                          <View style={styles.bookingCardRow}>
                            <MaterialIcons name="restaurant" size={16} color={colors.primary} />
                            <Text style={[styles.bookingCardLabel, { color: colors.textSecondary }]}>Restaurant</Text>
                            <Text style={[styles.bookingCardValue, { color: colors.text }]} numberOfLines={1}>
                              {msg.bookingIntent.restaurant ?? 'Not specified'}
                            </Text>
                          </View>
                          <View style={styles.bookingCardRow}>
                            <MaterialIcons name="group" size={16} color={colors.primary} />
                            <Text style={[styles.bookingCardLabel, { color: colors.textSecondary }]}>Guests</Text>
                            <Text style={[styles.bookingCardValue, { color: colors.text }]}>
                              {msg.bookingIntent.people ?? 2}
                            </Text>
                          </View>
                          <View style={styles.bookingCardRow}>
                            <MaterialIcons name="schedule" size={16} color={colors.primary} />
                            <Text style={[styles.bookingCardLabel, { color: colors.textSecondary }]}>Time</Text>
                            <Text style={[styles.bookingCardValue, { color: colors.text }]}>
                              {msg.bookingIntent.time ?? 'Not specified'}
                            </Text>
                          </View>
                          {msg.bookingIntent.note && (
                            <View style={styles.bookingCardRow}>
                              <MaterialIcons name="note" size={16} color={colors.primary} />
                              <Text style={[styles.bookingCardLabel, { color: colors.textSecondary }]}>Note</Text>
                              <Text style={[styles.bookingCardValue, { color: colors.text }]} numberOfLines={2}>
                                {msg.bookingIntent.note}
                              </Text>
                            </View>
                          )}
                          <Pressable
                            style={[styles.confirmBookingBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleConfirmBooking(msg.bookingIntent!, i)}>
                            <MaterialIcons name="check-circle" size={18} color={colors.primaryForeground} />
                            <Text style={[styles.confirmBookingText, { color: colors.primaryForeground }]}>
                              {strings.booking.confirm}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                    {msg.bookingConfirmed && msg.bookingIntent && (
                      <View style={[styles.bookingCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                        <View style={styles.bookingCardBody}>
                          <View style={styles.confirmedRow}>
                            <MaterialIcons name="check-circle" size={20} color={colors.success} />
                            <Text style={[styles.confirmedText, { color: colors.success }]}>Booking Confirmed</Text>
                          </View>
                        </View>
                      </View>
                    )}
                    {msg.recommendations?.map((rec, idx) =>
                      renderRecommendationCard(rec, idx),
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Loading */}
          {loading && (
            <View style={styles.assistantRow}>
              <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }]}>
                <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
              </View>
              <View style={[styles.loadingBubble, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[Typography.bodySm, { color: colors.textSecondary, marginLeft: Spacing.sm }]}>
                  Finding the perfect spots...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.inputBackground }]}
            value={input}
            onChangeText={setInput}
            placeholder="Where should we go tonight?"
            placeholderTextColor={colors.inputPlaceholder}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!loading}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || loading}
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim() && !loading ? colors.primary : colors.border,
              },
            ]}>
            <MaterialIcons
              name="arrow-upward"
              size={20}
              color={input.trim() && !loading ? colors.primaryForeground : colors.textTertiary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  welcome: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  suggestionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageWrap: {
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  assistantContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 16,
  },
  recCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recImage: {
    width: '100%',
    height: 120,
  },
  recContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  recName: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  recMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recMetaText: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  recReason: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
    marginTop: Spacing.sm,
  },
  bookButtonText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 22,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bookingCardImage: {
    width: '100%',
    height: 100,
  },
  bookingCardBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  bookingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bookingCardLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    width: 80,
  },
  bookingCardValue: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
    flex: 1,
  },
  confirmBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
    marginTop: Spacing.xs,
  },
  confirmBookingText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
  },
  confirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  confirmedText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 15,
  },
});
