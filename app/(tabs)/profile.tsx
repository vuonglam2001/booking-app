import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography, FontFamily } from '@/constants/typography';
import { LANGUAGE_LABELS, type Language } from '@/constants/i18n';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { useBookings } from '@/hooks/use-bookings';

export default function ProfileScreen() {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];
  const { language, setLanguage, strings } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { reservations } = useBookings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languageOptions: Language[] = ['en', 'vi'];

  const bookingsCount = reservations.length;
  const favoritesCount = 5;
  const reviewsCount = 8;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = [
    { label: 'Bookings', value: bookingsCount },
    { label: 'Favorites', value: favoritesCount },
    { label: 'Reviews', value: reviewsCount },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {!isAuthenticated ? (
          <View style={styles.signInSection}>
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: colors.inputBackground }]}>
              <IconSymbol name="person.fill" size={32} color={colors.textTertiary} />
            </View>
            <Text
              style={[
                Typography.body,
                { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg },
              ]}>
              {strings.profile.signInPrompt}
            </Text>
            <Button
              title={strings.profile.signIn}
              onPress={() => router.push('/auth/login')}
              fullWidth
            />
          </View>
        ) : (
          <>
            {/* Avatar + User Info */}
            <View style={styles.userSection}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                  {getInitials(user?.name ?? '')}
                </Text>
              </View>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name}
              </Text>
              <Text style={[Typography.bodySm, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Saved Venues */}
          <Pressable
            style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => {}}>
            <View style={styles.menuLeft}>
              <MaterialIcons name="favorite-border" size={22} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
                {strings.profile.savedVenues}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </Pressable>

          {/* Notifications */}
          <Pressable
            style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.menuLeft}>
              <MaterialIcons name="notifications-none" size={22} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
                {strings.profile.notifications}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
            />
          </Pressable>

          {/* Language */}
          <Pressable
            style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setLanguageModalVisible(true)}>
            <View style={styles.menuLeft}>
              <MaterialIcons name="language" size={22} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
                {strings.profile.language}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[Typography.bodySm, { color: colors.textSecondary, marginRight: Spacing.sm }]}>
                {LANGUAGE_LABELS[language]}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
            </View>
          </Pressable>

          {/* Account Settings */}
          <Pressable style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuLeft}>
              <MaterialIcons name="settings" size={22} color={colors.textSecondary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
                {strings.profile.accountSettings}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Sign Out */}
        {isAuthenticated && (
          <View style={styles.signOutSection}>
            <Pressable
              onPress={logout}
              style={[styles.signOutButton, { borderColor: colors.primary }]}>
              <MaterialIcons name="logout" size={20} color={colors.primary} style={{ marginRight: Spacing.sm }} />
              <Text style={[Typography.button, { color: colors.primary }]}>
                {strings.profile.signOut}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLanguageModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {strings.profile.language}
            </Text>
            {languageOptions.map((lang) => (
              <Pressable
                key={lang}
                style={[
                  styles.languageOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModalVisible(false);
                }}>
                <Text
                  style={[
                    Typography.body,
                    { color: lang === language ? colors.primary : colors.text },
                  ]}>
                  {LANGUAGE_LABELS[lang]}
                </Text>
                {lang === language && (
                  <MaterialIcons name="check" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  signInSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 32,
  },
  userName: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 20,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 24,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
  },
  menuSection: {
    marginHorizontal: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutSection: {
    paddingHorizontal: Spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  modalTitle: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 18,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
});
