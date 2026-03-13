import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography, FontFamily } from '@/constants/typography';
import { useAppMode } from '@/hooks/use-app-mode';
import type { CuisineType, MusicType } from '@/types';

// --- Data ---

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const TIME_OPTIONS = [
  '11:00', '11:30', '12:00', '12:30',
  '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00',
];

const CITIES = ['Ho Chi Minh', 'Ha Noi', 'Da Nang'];

const DISTRICTS: Record<string, { name: string; description: string }[]> = {
  'Ho Chi Minh': [
    { name: 'All Districts', description: 'All areas' },
    { name: 'District 1', description: 'Ben Thanh, Nguyen Hue...' },
    { name: 'Thu Duc City', description: 'Thao Dien, An Phu...' },
    { name: 'District 3', description: 'Vo Van Tan, Le Van Sy...' },
    { name: 'District 7', description: 'Phu My Hung, Crescent...' },
    { name: 'Binh Thanh', description: 'Phan Xich Long, Van Kiep...' },
    { name: 'Phu Nhuan', description: 'Phan Dinh Phung...' },
  ],
  'Ha Noi': [
    { name: 'All Districts', description: 'All areas' },
    { name: 'Hoan Kiem', description: 'Old Quarter...' },
    { name: 'Ba Dinh', description: 'West Lake...' },
    { name: 'Tay Ho', description: 'Xuan Dieu, Quang An...' },
  ],
  'Da Nang': [
    { name: 'All Districts', description: 'All areas' },
    { name: 'Hai Chau', description: 'City center...' },
    { name: 'Son Tra', description: 'My Khe beach...' },
  ],
};

const CUISINE_OPTIONS: { label: string; value: CuisineType }[] = [
  { label: 'Vietnamese', value: 'vietnamese' },
  { label: 'Japanese', value: 'japanese' },
  { label: 'Italian', value: 'italian' },
  { label: 'French', value: 'french' },
  { label: 'Korean', value: 'korean' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Fusion', value: 'fusion' },
  { label: 'Seafood', value: 'seafood' },
];

const MUSIC_OPTIONS: { label: string; value: MusicType }[] = [
  { label: 'EDM', value: 'edm' },
  { label: 'House', value: 'house' },
  { label: 'Techno', value: 'techno' },
  { label: 'Hip Hop', value: 'hiphop' },
  { label: 'R&B', value: 'rnb' },
  { label: 'Jazz', value: 'jazz' },
  { label: 'Live', value: 'live' },
  { label: 'Latin', value: 'latin' },
];

function formatVND(value: number): string {
  if (value === 0) return '0';
  return value.toLocaleString('vi-VN');
}

const RATING_OPTIONS = [
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4.0 },
  { label: '3.5+', value: 3.5 },
];

// --- Component ---

export default function FilterScreen() {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];

  const [guests, setGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [selectedCity, setSelectedCity] = useState('Ho Chi Minh');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [kidFriendly, setKidFriendly] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicType[]>([]);
  const [priceMin, setPriceMin] = useState('0');
  const [priceMax, setPriceMax] = useState('3000000');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const toggleCuisine = (c: CuisineType) => {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleMusic = (m: MusicType) => {
    setSelectedMusic((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const clearAll = () => {
    setGuests(2);
    setSelectedTime('19:00');
    setSelectedCity('Ho Chi Minh');
    setSelectedDistrict('All Districts');
    setKidFriendly(false);
    setSelectedCuisines([]);
    setSelectedMusic([]);
    setPriceMin('0');
    setPriceMax('3000000');
    setSelectedRating(null);
  };

  const categoryOptions = mode === 'dining' ? CUISINE_OPTIONS : MUSIC_OPTIONS;
  const selectedCategories = mode === 'dining' ? selectedCuisines : selectedMusic;
  const toggleCategory = (value: string) => {
    if (mode === 'dining') {
      toggleCuisine(value as CuisineType);
    } else {
      toggleMusic(value as MusicType);
    }
  };

  const districts = DISTRICTS[selectedCity] ?? [];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={[Typography.h3, { color: colors.text, flex: 1, textAlign: 'center' }]}>
          Filters
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Guests */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.h3, { color: colors.text }]}>Number of guests?</Text>
          <View style={styles.grid}>
            {GUEST_OPTIONS.map((n) => (
              <Pressable
                key={n}
                onPress={() => setGuests(n)}
                style={[
                  styles.gridItem,
                  {
                    borderColor: guests === n ? colors.primary : colors.border,
                    backgroundColor: guests === n ? colors.primary + '10' : colors.surface,
                  },
                ]}>
                <Text
                  style={[
                    styles.gridText,
                    {
                      color: guests === n ? colors.primary : colors.text,
                      fontFamily: guests === n ? FontFamily.sansSemiBold : FontFamily.sansRegular,
                    },
                  ]}>
                  {n}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setGuests(Math.min(guests + 1, 20))}
              style={[styles.gridItem, { borderColor: colors.border }]}>
              <MaterialIcons name="add" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Kid friendly */}
          {mode === 'dining' && (
            <Pressable
              onPress={() => setKidFriendly(!kidFriendly)}
              style={[styles.checkRow, { borderTopColor: colors.border }]}>
              <MaterialIcons name="child-care" size={20} color={colors.textSecondary} />
              <Text style={[Typography.bodySm, { color: colors.text, flex: 1 }]}>
                Kid-friendly restaurants
              </Text>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: kidFriendly ? colors.primary : colors.border,
                    backgroundColor: kidFriendly ? colors.primary : 'transparent',
                  },
                ]}>
                {kidFriendly && (
                  <MaterialIcons name="check" size={14} color={colors.primaryForeground} />
                )}
              </View>
            </Pressable>
          )}
        </View>

        {/* Arrival Time */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.h3, { color: colors.text }]}>Arrival time?</Text>
          <View style={styles.chipWrap}>
            {TIME_OPTIONS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setSelectedTime(t)}
                style={[
                  styles.timeChip,
                  {
                    borderColor: selectedTime === t ? colors.primary : colors.border,
                    backgroundColor: selectedTime === t ? colors.primary + '10' : colors.surface,
                  },
                ]}>
                <Text
                  style={[
                    Typography.bodySm,
                    {
                      color: selectedTime === t ? colors.primary : colors.text,
                      fontFamily: selectedTime === t ? FontFamily.sansSemiBold : FontFamily.sansRegular,
                    },
                  ]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Area - City + District */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.h3, { color: colors.text }]}>Area?</Text>

          {/* City selector */}
          <Text style={[Typography.bodySm, { color: colors.textSecondary, fontFamily: FontFamily.sansMedium }]}>
            City
          </Text>
          <View style={styles.cityRow}>
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <Pressable
                  key={city}
                  onPress={() => {
                    setSelectedCity(city);
                    setSelectedDistrict('All Districts');
                  }}
                  style={[
                    styles.cityCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
                    },
                  ]}>
                  <MaterialIcons
                    name="location-city"
                    size={24}
                    color={isSelected ? colors.primary : colors.textTertiary}
                  />
                  <Text
                    style={[
                      Typography.bodySm,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected ? FontFamily.sansSemiBold : FontFamily.sansRegular,
                        textAlign: 'center',
                      },
                    ]}>
                    {city}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* District selector */}
          <Text style={[Typography.bodySm, { color: colors.textSecondary, fontFamily: FontFamily.sansMedium }]}>
            District
          </Text>
          <View style={styles.districtGrid}>
            {districts.map((d) => {
              const isSelected = selectedDistrict === d.name;
              return (
                <Pressable
                  key={d.name}
                  onPress={() => setSelectedDistrict(d.name)}
                  style={[
                    styles.districtCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.districtName,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected ? FontFamily.sansSemiBold : FontFamily.sansMedium,
                      },
                    ]}
                    numberOfLines={1}>
                    {d.name}
                  </Text>
                  <Text
                    style={[styles.districtDesc, { color: colors.textTertiary }]}
                    numberOfLines={1}>
                    {d.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Category (Cuisine / Music) */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {mode === 'dining' ? 'Cuisine' : 'Music'}
          </Text>
          <View style={styles.categoryGrid}>
            {categoryOptions.map((opt) => {
              const isSelected = (selectedCategories as string[]).includes(opt.value);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => toggleCategory(opt.value)}
                  style={[
                    styles.categoryItem,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
                    },
                  ]}>
                  <Text
                    style={[
                      Typography.bodySm,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected ? FontFamily.sansSemiBold : FontFamily.sansRegular,
                      },
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Rating */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.h3, { color: colors.text }]}>Rating</Text>
          <View style={styles.chipWrap}>
            {RATING_OPTIONS.map((r) => {
              const isSelected = selectedRating === r.value;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => setSelectedRating(isSelected ? null : r.value)}
                  style={[
                    styles.ratingChip,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
                    },
                  ]}>
                  <MaterialIcons
                    name="star"
                    size={16}
                    color={isSelected ? colors.primary : colors.warning}
                  />
                  <Text
                    style={[
                      Typography.bodySm,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected ? FontFamily.sansSemiBold : FontFamily.sansRegular,
                      },
                    ]}>
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Price Range */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.h3, { color: colors.text }]}>Price Range</Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            Cost per person (VND)
          </Text>
          <View style={styles.priceRow}>
            <View style={[styles.priceInput, { borderColor: colors.border, backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Min</Text>
              <TextInput
                style={[styles.priceValue, { color: colors.text }]}
                value={formatVND(parseInt(priceMin || '0', 10))}
                onChangeText={(t) => setPriceMin(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.inputPlaceholder}
              />
              <Text style={[styles.priceSuffix, { color: colors.primary }]}>₫</Text>
            </View>
            <Text style={[Typography.body, { color: colors.textTertiary }]}>—</Text>
            <View style={[styles.priceInput, { borderColor: colors.border, backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Max</Text>
              <TextInput
                style={[styles.priceValue, { color: colors.text }]}
                value={formatVND(parseInt(priceMax || '0', 10))}
                onChangeText={(t) => setPriceMax(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="3,000,000"
                placeholderTextColor={colors.inputPlaceholder}
              />
              <Text style={[styles.priceSuffix, { color: colors.primary }]}>₫</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable onPress={clearAll} style={styles.clearButton}>
          <Text style={[Typography.button, { color: colors.text, textDecorationLine: 'underline' }]}>
            Clear all
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/(tabs)/search'), 100);
          }}
          style={[styles.resultsButton, { backgroundColor: colors.primary }]}>
          <Text style={[Typography.button, { color: colors.primaryForeground }]}>
            View results
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridItem: {
    width: 56,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: {
    fontSize: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  cityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  districtGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  districtCard: {
    width: '31%',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  districtName: {
    fontSize: 13,
    marginBottom: 2,
  },
  districtDesc: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    lineHeight: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm + 2,
  },
  priceLabel: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
    padding: 0,
  },
  priceSuffix: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.sm + 4,
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg + 10,
    borderTopWidth: 1,
  },
  clearButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  resultsButton: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
  },
});
