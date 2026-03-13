import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/ui/booking-status-badge';
import { StarRating } from '@/components/ui/star-rating';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography, FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useBookings } from '@/hooks/use-bookings';
import { getVenueById } from '@/data';
import { getReviewByBookingId, saveReview } from '@/data/reviews';
import { formatDate, formatTime, formatPriceRange } from '@/utils/format';
import type { BookingReview } from '@/types';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mode } = useAppMode();
  const { language, strings } = useLanguage();
  const colors = ThemeColors[mode];
  const { reservations, cancelReservation } = useBookings();
  const dateLocale = language === 'vi' ? 'vi-VN' : 'en-US';

  const reservation = reservations.find((r) => r.id === id);
  const venue = reservation ? getVenueById(reservation.venueId) : undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<BookingReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.remove();
  }, []);

  const loadReview = useCallback(async () => {
    if (!id) return;
    const review = await getReviewByBookingId(id);
    if (review) setExistingReview(review);
  }, [id]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  if (!reservation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            Booking not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitReview = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);

    const review: BookingReview = {
      bookingId: reservation.id,
      restaurantId: reservation.venueId,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    await saveReview(review);
    setExistingReview(review);
    setSubmitting(false);
  };

  const handleCancel = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedReason) return;
    cancelReservation(reservation.id, selectedReason);
    setCancelModalVisible(false);
    setSelectedReason(null);
  };

  const cancelReasonKeys = [
    'changeOfPlans',
    'foundBetterOption',
    'schedulingConflict',
    'tooExpensive',
    'weatherConditions',
    'other',
  ] as const;

  const isCompleted = reservation.status === 'completed';
  const canCancel = reservation.status === 'confirmed' || reservation.status === 'ongoing';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Venue Image */}
        {venue && (
          <Image
            source={{ uri: venue.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        {/* Venue Name & Status */}
        <View style={styles.section}>
          <View style={styles.nameRow}>
            <View style={styles.nameCol}>
              <Text style={[Typography.h1, { color: colors.text }]}>
                {reservation.venueName}
              </Text>
              {venue && (
                <Text style={[Typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                  {venue.address}, {venue.district}
                </Text>
              )}
            </View>
            <BookingStatusBadge status={reservation.status} />
          </View>
        </View>

        {/* Booking Info Card */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow
              icon="event"
              label={strings.bookingDetail.date}
              value={formatDate(reservation.date, dateLocale)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow
              icon="schedule"
              label={strings.bookingDetail.time}
              value={formatTime(reservation.time)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow
              icon="group"
              label={strings.bookingDetail.guests}
              value={`${reservation.guests} ${reservation.guests === 1 ? strings.common.guest : strings.common.guests}`}
              colors={colors}
            />
            {reservation.phoneNumber && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <InfoRow
                  icon="phone"
                  label={strings.confirmation.phone}
                  value={reservation.phoneNumber}
                  colors={colors}
                />
              </>
            )}
            {venue && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <InfoRow
                  icon="payments"
                  label={strings.filters.price}
                  value={formatPriceRange(venue.priceRange.min, venue.priceRange.max)}
                  colors={colors}
                />
              </>
            )}
          </View>
        </View>

        {/* Cancel Reason (shown when cancelled) */}
        {reservation.status === 'cancelled' && reservation.cancelReason && (
          <View style={styles.section}>
            <View style={[styles.cancelReasonCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
              <MaterialIcons name="info-outline" size={20} color={colors.error} />
              <Text style={[Typography.body, { color: colors.error, flex: 1 }]}>
                {strings.bookingDetail.cancelReasons[reservation.cancelReason as keyof typeof strings.bookingDetail.cancelReasons] ?? reservation.cancelReason}
              </Text>
            </View>
          </View>
        )}

        {/* Special Requests */}
        {reservation.specialRequests && (
          <View style={styles.section}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
              {strings.bookingDetail.specialRequests}
            </Text>
            <View style={[styles.requestsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                {reservation.specialRequests}
              </Text>
            </View>
          </View>
        )}

        {/* Review Section — only for completed bookings */}
        {isCompleted && (
          <View style={styles.section}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
              {existingReview ? strings.bookingDetail.yourReview : strings.bookingDetail.reviewTitle}
            </Text>

            {existingReview ? (
              /* Show submitted review */
              <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.reviewBanner, { backgroundColor: colors.success + '15' }]}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={[styles.reviewBannerText, { color: colors.success }]}>
                    {strings.bookingDetail.reviewSubmitted}
                  </Text>
                </View>
                <View style={styles.reviewBody}>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
                    {strings.bookingDetail.yourRating}
                  </Text>
                  <StarRating value={existingReview.rating} disabled size={28} />
                  {existingReview.comment ? (
                    <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md }]}>
                      "{existingReview.comment}"
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              /* Review form */
              <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.reviewBody}>
                  <Text style={[Typography.bodySm, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
                    {strings.bookingDetail.yourRating}
                  </Text>
                  <StarRating value={rating} onChange={setRating} size={36} />

                  <TextInput
                    style={[
                      styles.reviewInput,
                      Typography.body,
                      {
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={comment}
                    onChangeText={setComment}
                    placeholder={strings.bookingDetail.reviewPlaceholder}
                    placeholderTextColor={colors.inputPlaceholder}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <Button
                    title={submitting ? '...' : strings.bookingDetail.submitReview}
                    onPress={handleSubmitReview}
                    fullWidth
                    disabled={rating === 0 || submitting}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <View style={styles.section}>
            <Button
              title={strings.bookingDetail.cancelBooking}
              onPress={handleCancel}
              variant="outline"
              fullWidth
            />
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Cancel Reason Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCancelModalVisible(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onPress={() => {}}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.xs }]}>
              {strings.bookingDetail.cancelReasonTitle}
            </Text>
            <Text style={[Typography.bodySm, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
              {strings.bookingDetail.cancelReasonSubtitle}
            </Text>

            {cancelReasonKeys.map((key) => {
              const label = strings.bookingDetail.cancelReasons[key];
              const isSelected = selectedReason === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setSelectedReason(key)}
                  style={[
                    styles.reasonOption,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary + '10' : colors.background,
                    },
                  ]}>
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: isSelected ? colors.primary : colors.textTertiary },
                    ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.modalActions}>
              <Button
                title={strings.common.cancel}
                onPress={() => {
                  setCancelModalVisible(false);
                  setSelectedReason(null);
                }}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <Button
                title={strings.bookingDetail.confirmCancel}
                onPress={handleConfirmCancel}
                disabled={!selectedReason}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<() => typeof ThemeColors['dining']>;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
        <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  nameCol: {
    flex: 1,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoValue: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  requestsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cancelReasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  reviewBannerText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
  },
  reviewBody: {
    padding: Spacing.md,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.lg,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
