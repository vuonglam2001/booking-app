import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { EmptyState } from '@/components/ui/empty-state';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useNotifications } from '@/hooks/use-notifications';
import type { AppNotification, NotificationType } from '@/types';

const ICON_MAP: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  booking_completed: 'check-circle',
  booking_confirmed: 'event-available',
  review_prompt: 'rate-review',
};

function formatRelativeDate(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
  const { mode } = useAppMode();
  const { language, strings } = useLanguage();
  const colors = ThemeColors[mode];
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handlePress = useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);
      router.push({
        pathname: '/booking-detail/[id]',
        params: { id: notification.bookingId },
      });
    },
    [markAsRead],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const title = language === 'vi' ? item.titleVi : item.titleEn;
      const body = language === 'vi' ? item.bodyVi : item.bodyEn;
      const iconName = ICON_MAP[item.type] ?? 'notifications';
      const iconColor = item.type === 'booking_completed' ? colors.success : colors.primary;

      return (
        <Pressable
          onPress={() => handlePress(item)}
          style={[
            styles.card,
            {
              backgroundColor: item.read ? colors.surface : colors.primary + '08',
              borderColor: item.read ? colors.border : colors.primary + '25',
            },
          ]}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + '15' }]}>
            <MaterialIcons name={iconName} size={22} color={iconColor} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                    fontFamily: item.read ? FontFamily.sansRegular : FontFamily.sansSemiBold,
                  },
                ]}
                numberOfLines={1}>
                {title}
              </Text>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text
              style={[styles.cardBody, { color: colors.textSecondary }]}
              numberOfLines={2}>
              {body}
            </Text>
            <Text style={[styles.cardTime, { color: colors.textTertiary }]}>
              {formatRelativeDate(item.createdAt)}
            </Text>
          </View>
        </Pressable>
      );
    },
    [language, colors, handlePress],
  );

  if (notifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="bell"
          title={strings.notifications.empty}
          description={strings.notifications.emptyDesc}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          unreadCount > 0 ? (
            <View style={styles.headerRow}>
              <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
                {unreadCount} {strings.notifications.title.toLowerCase()}
              </Text>
              <Pressable onPress={markAllAsRead} hitSlop={8}>
                <Text style={[styles.markAllBtn, { color: colors.primary }]}>
                  {strings.notifications.markAllRead}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  headerCount: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
  },
  markAllBtn: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardBody: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  cardTime: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});
