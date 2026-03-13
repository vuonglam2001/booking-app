import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/spacing";
import { ThemeColors } from "@/constants/theme";
import { FontFamily } from "@/constants/typography";
import { getVenuesByMode } from "@/data";
import { useAppMode } from "@/hooks/use-app-mode";
import { useLanguage } from "@/hooks/use-language";
import type { Venue } from "@/types";

// Pre-load marker image at module scope so it's available immediately
const MARKER_IMAGE = require("@/assets/images/restaurant-location.png");

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? "";

// HCM City center
const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.6956,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatVndPrice(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;
  return `${fmt(min)} - ${fmt(max)}`;
}

// Google Maps dark style fallback (when no Goong key)
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d0d1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#555570" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#242440" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f0f1f" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

export default function NearbyMapScreen() {
  const { mode } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];
  const insets = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const venues = useMemo(() => getVenuesByMode(mode), [mode]);

  // Search results dropdown — searches ALL venues (not region-limited)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return venues
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.cuisineTypes?.some((c) => c.toLowerCase().includes(q)) ||
          v.musicTypes?.some((m) => m.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [venues, searchQuery]);

  // Only show markers within visible map region
  const visibleVenues = useMemo(() => {
    let list = venues;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)) ||
          v.cuisineTypes?.some((c) => c.toLowerCase().includes(q)) ||
          v.musicTypes?.some((m) => m.toLowerCase().includes(q)),
      );
    }
    const halfLat = region.latitudeDelta / 2;
    const halfLng = region.longitudeDelta / 2;
    return list.filter((v) => {
      const { latitude: lat, longitude: lng } = v.coordinates;
      return (
        lat >= region.latitude - halfLat &&
        lat <= region.latitude + halfLat &&
        lng >= region.longitude - halfLng &&
        lng <= region.longitude + halfLng
      );
    });
  }, [venues, region, searchQuery]);

  // Request user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // Animate bottom card in/out
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: selectedVenue ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [selectedVenue, cardAnim]);

  const handleSearchSelect = useCallback((venue: Venue) => {
    setSearchQuery(venue.name);
    setSearchFocused(false);
    Keyboard.dismiss();
    setSelectedVenue(venue);
    mapRef.current?.animateToRegion(
      {
        latitude: venue.coordinates.latitude - 0.004,
        longitude: venue.coordinates.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      300,
    );
  }, []);

  const handleMarkerPress = useCallback((venue: Venue) => {
    setSelectedVenue(venue);
    mapRef.current?.animateToRegion(
      {
        latitude: venue.coordinates.latitude - 0.004,
        longitude: venue.coordinates.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      300,
    );
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  const handleCenterUser = useCallback(() => {
    const target = userLocation ?? DEFAULT_REGION;
    mapRef.current?.animateToRegion(
      { ...target, latitudeDelta: 0.015, longitudeDelta: 0.015 },
      300,
    );
  }, [userLocation]);

  const distance = useMemo(() => {
    if (!selectedVenue || !userLocation) return null;
    return haversineKm(
      userLocation.latitude,
      userLocation.longitude,
      selectedVenue.coordinates.latitude,
      selectedVenue.coordinates.longitude,
    );
  }, [selectedVenue, userLocation]);

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const isDark = mode === "nightlife";
  const useGoongTiles =
    !!GOONG_API_KEY && GOONG_API_KEY !== "YOUR_GOONG_API_KEY";

  const goongTileUrl = useGoongTiles
    ? isDark
      ? `https://tile.goong.io/assets/goong_map_dark/{z}/{x}/{y}@2x.png?api_key=${GOONG_API_KEY}`
      : `https://tile.goong.io/assets/goong_map_web/{z}/{x}/{y}@2x.png?api_key=${GOONG_API_KEY}`
    : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
        mapType="standard"
      >
        {goongTileUrl && (
          <UrlTile
            urlTemplate={goongTileUrl}
            maximumZ={19}
            flipY={false}
            tileSize={256}
          />
        )}

        {visibleVenues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={venue.coordinates}
            onPress={() => handleMarkerPress(venue)}
            image={MARKER_IMAGE}
            anchor={{ x: 0.5, y: 0.9 }}
            style={{
              width: 20,
              height: 58,
            }}
            tracksViewChanges={false}
          />
        ))}
      </MapView>

      {/* Top search overlay */}
      <View
        style={[styles.topOverlay, { paddingTop: insets.top + Spacing.sm }]}
      >
        <Pressable
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? colors.surface : "#FFFFFF" },
          ]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? colors.surface : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialIcons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={
              mode === "dining"
                ? strings.home.searchPlaceholder
                : strings.home.searchPlaceholderNightlife
            }
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <MaterialIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Search results dropdown */}
      {searchFocused && searchResults.length > 0 && (
        <View
          style={[
            styles.searchDropdown,
            {
              top: insets.top + Spacing.sm + 52,
              backgroundColor: isDark ? colors.surface : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.searchResultItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSearchSelect(item)}
              >
                <MaterialIcons
                  name={mode === "dining" ? "restaurant" : "nightlife"}
                  size={18}
                  color={colors.primary}
                  style={styles.searchResultIcon}
                />
                <View style={styles.searchResultInfo}>
                  <Text
                    style={[styles.searchResultName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.searchResultAddr,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.address}
                  </Text>
                </View>
                <View style={styles.searchResultMeta}>
                  <MaterialIcons name="star" size={12} color="#FBBF24" />
                  <Text
                    style={[styles.searchResultRating, { color: colors.text }]}
                  >
                    {item.rating}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* My location button */}
      <Pressable
        style={[
          styles.myLocationBtn,
          {
            backgroundColor: isDark ? colors.surface : "#FFFFFF",
            bottom: selectedVenue ? 260 + insets.bottom : 90 + insets.bottom,
          },
        ]}
        onPress={handleCenterUser}
      >
        <MaterialIcons name="my-location" size={22} color={colors.primary} />
      </Pressable>

      {/* Bottom venue card */}
      <Animated.View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + Spacing.md,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
        pointerEvents={selectedVenue ? "auto" : "none"}
      >
        {selectedVenue && (
          <>
            {/* Drag handle */}
            <View style={styles.dragHandle}>
              <View
                style={[styles.handleBar, { backgroundColor: colors.border }]}
              />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <Text
                  style={[styles.venueName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {selectedVenue.name}
                </Text>
                <Text
                  style={[styles.venueAddress, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {selectedVenue.address}
                </Text>

                <View style={styles.metaRow}>
                  <MaterialIcons name="star" size={14} color="#FBBF24" />
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {selectedVenue.rating}
                  </Text>
                  <Text
                    style={[styles.priceText, { color: colors.textSecondary }]}
                  >
                    {formatVndPrice(
                      selectedVenue.priceRange.min,
                      selectedVenue.priceRange.max,
                    )}
                  </Text>
                </View>

                {distance !== null && (
                  <View style={styles.distanceRow}>
                    <MaterialIcons
                      name="directions-walk"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.distanceText, { color: colors.primary }]}
                    >
                      {distance < 1
                        ? `${Math.round(distance * 1000)}m`
                        : `${distance.toFixed(1)}km`}
                    </Text>
                  </View>
                )}

                <Pressable
                  style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                  onPress={() =>
                    router.push({
                      pathname: "/venue/[id]",
                      params: { id: selectedVenue.id },
                    })
                  }
                >
                  <Text
                    style={[
                      styles.bookBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {strings.venue.bookNow}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.thumbColumn}>
                {selectedVenue.photos?.slice(0, 2).map((url, idx) => (
                  <Image key={idx} source={{ uri: url }} style={styles.thumb} />
                ))}
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  /* Top overlay */
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm + 4 : Spacing.sm + 2,
    borderRadius: 24,
    borderWidth: 1,
    gap: Spacing.sm,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.sansRegular,
    fontSize: 15,
    padding: 0,
  },

  /* Search dropdown */
  searchDropdown: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    maxHeight: 320,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchResultIcon: {
    marginRight: Spacing.sm + 2,
  },
  searchResultInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  searchResultName: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
    marginBottom: 1,
  },
  searchResultAddr: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
  },
  searchResultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  searchResultRating: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
  },

  /* My location button */
  myLocationBtn: {
    position: "absolute",
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  /* Bottom card */
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.md,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dragHandle: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  cardContent: {
    flexDirection: "row",
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  venueName: {
    fontFamily: FontFamily.sansBold,
    fontSize: 18,
    marginBottom: 2,
  },
  venueAddress: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
  },
  priceText: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 13,
    marginLeft: 4,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: Spacing.sm,
  },
  distanceText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
  },
  bookBtn: {
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  bookBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
  },
  thumbColumn: {
    gap: Spacing.sm,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#2A2A3C",
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 58,
  },
  markerImage: {
    width: 44,
    height: 50,
  },
  markerImageSelected: {
    width: 52,
    height: 58,
  },
});

