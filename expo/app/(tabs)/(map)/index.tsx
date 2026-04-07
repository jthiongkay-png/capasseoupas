import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated, ScrollView, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { CheckCircle, XCircle, Locate, MapPin, UtensilsCrossed, Coffee, Wine, ShoppingBag, Hotel, Fuel, ShoppingCart, Gamepad2, Heart, Bus, MoreHorizontal, ListFilter } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useFilteredPlaces, usePlaces } from '@/providers/PlacesProvider';
import { Place, PlaceCategory, CATEGORY_LABELS } from '@/types';
import FloatingActionButton from '@/components/FloatingActionButton';
import PlaceCard from '@/components/PlaceCard';
import AdBanner, { AD_BANNER_HEIGHT } from '@/components/AdBanner';
import { useLocation } from '@/providers/LocationProvider';



const CATEGORY_ICONS: Record<PlaceCategory, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  bar: Wine,
  shop: ShoppingBag,
  hotel: Hotel,
  gas_station: Fuel,
  grocery: ShoppingCart,
  entertainment: Gamepad2,
  health: Heart,
  transport: Bus,
  other: MoreHorizontal,
};

const ALL_CATEGORIES: PlaceCategory[] = [
  'restaurant', 'cafe', 'bar', 'shop', 'hotel',
  'gas_station', 'grocery', 'entertainment', 'health', 'transport', 'other',
];

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const DEFAULT_REGION: Region = {
  latitude: 46.6034,
  longitude: 2.3488,
  latitudeDelta: 10.0,
  longitudeDelta: 10.0,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'accepted' | 'refused'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);

  const allPlaces = useFilteredPlaces('', null, 'all');
  const filteredPlaces = useFilteredPlaces('', selectedCategory, filter);
  const { places } = usePlaces();
  const { userLocation, requestLocation } = useLocation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const initialRegion = useMemo<Region>(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
    }
    return DEFAULT_REGION;
  }, [userLocation]);

  const hasAnimatedToUser = useRef(false);
  const pendingCenterOnLocation = useRef(false);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      if (!hasAnimatedToUser.current || pendingCenterOnLocation.current) {
        hasAnimatedToUser.current = true;
        pendingCenterOnLocation.current = false;
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          600
        );
      }
    }
  }, [userLocation]);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [adVisible, setAdVisible] = useState(false);

  const adOffset = adVisible ? AD_BANNER_HEIGHT : 0;

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return places.find((p) => p.id === selectedPlaceId) ?? null;
  }, [selectedPlaceId, places]);

  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(200)).current;

  const handleCategoryPress = useCallback((cat: PlaceCategory) => {
    setSelectedCategory((prev) => (prev === cat ? null : cat));
  }, []);

  const handleMarkerPress = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleMapPress = useCallback(() => {
    Keyboard.dismiss();
    if (selectedPlaceId) {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSelectedPlaceId(null));
    }
  }, [selectedPlaceId, slideAnim]);

  const handlePlacePress = useCallback((place: Place) => {
    router.push(`/place/${place.id}` as any);
  }, [router]);

  const handleAddReport = useCallback(() => {
    router.push('/add-report' as any);
  }, [router]);

  const handleCenterMap = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    } else {
      pendingCenterOnLocation.current = true;
      void requestLocation();
    }
  }, [userLocation, requestLocation]);

  const acceptedCount = useMemo(() => allPlaces.filter((p) => p.accepted).length, [allPlaces]);
  const refusedCount = useMemo(() => allPlaces.filter((p) => !p.accepted).length, [allPlaces]);

  const renderCategoryFilters = useCallback(() => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryRow}
    >
      {ALL_CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat];
        const isSelected = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
            onPress={() => handleCategoryPress(cat)}
            activeOpacity={0.7}
            testID={`category-${cat}`}
          >
            <Icon size={14} color={isSelected ? '#FFFFFF' : colors.textSecondary} strokeWidth={isSelected ? 2.2 : 1.5} />
            <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
              {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ), [styles, selectedCategory, handleCategoryPress, colors]);

  const renderStatusFilters = useCallback(() => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => { setFilter('all'); Keyboard.dismiss(); }}
        activeOpacity={0.7}
        testID="filter-all"
      >
        <View style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}>
          <ListFilter size={13} color={filter === 'all' ? '#FFFFFF' : colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            Tous ({allPlaces.length})
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => { setFilter('accepted'); Keyboard.dismiss(); }}
        activeOpacity={0.7}
        testID="filter-accepted"
      >
        <View style={[styles.filterChip, filter === 'accepted' && styles.filterChipAccepted]}>
          <CheckCircle size={13} color={filter === 'accepted' ? '#FFFFFF' : colors.accepted} strokeWidth={2} />
          <Text style={[styles.filterChipText, filter === 'accepted' && styles.filterChipTextActive]}>
            Accepté ({acceptedCount})
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => { setFilter('refused'); Keyboard.dismiss(); }}
        activeOpacity={0.7}
        testID="filter-refused"
      >
        <View style={[styles.filterChip, filter === 'refused' && styles.filterChipRefused]}>
          <XCircle size={13} color={filter === 'refused' ? '#FFFFFF' : colors.refused} strokeWidth={2} />
          <Text style={[styles.filterChipText, filter === 'refused' && styles.filterChipTextActive]}>
            Refusé ({refusedCount})
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  ), [styles, filter, allPlaces.length, acceptedCount, refusedCount, colors]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        testID="native-map"
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            onPress={() => handleMarkerPress(place)}
            pinColor={place.accepted ? colors.accepted : colors.refused}
          />
        ))}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 20 }]}>
        {renderCategoryFilters()}
        {renderStatusFilters()}
      </View>

      <TouchableOpacity
        style={[styles.centerButtonWrap, { bottom: selectedPlace ? 280 + adOffset : 94 + adOffset }]}
        onPress={handleCenterMap}
        activeOpacity={0.8}
        testID="center-map-button"
      >
        <View style={styles.centerButton}>
          <Locate size={20} color={colors.primary} strokeWidth={1.5} />
        </View>
      </TouchableOpacity>

      {selectedPlace && (
        <Animated.View style={[styles.selectedCard, { bottom: 90 + adOffset, transform: [{ translateY: slideAnim }] }]}>
          <PlaceCard place={selectedPlace} onPress={handlePlacePress} compact={false} />
        </Animated.View>
      )}

      <FloatingActionButton onPress={handleAddReport} bottomOffset={adOffset} />

      <View style={styles.adContainer}>
        <AdBanner onAdLoaded={() => setAdVisible(true)} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingRight: 20,
    gap: 8,
    paddingBottom: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterChipWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: colors.filterActive,
    borderColor: colors.filterActive,
  },
  filterChipAccepted: {
    backgroundColor: colors.accepted,
    borderColor: colors.accepted,
  },
  filterChipRefused: {
    backgroundColor: colors.refused,
    borderColor: colors.refused,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  centerButtonWrap: {
    position: 'absolute',
    right: 27,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  centerButton: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCard: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  webHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  webList: {
    flex: 1,
  },
  webListContent: {
    paddingVertical: 16,
    gap: 0,
    paddingBottom: 100,
  },
  webMapNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.searchBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  webMapNoticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: colors.textSecondary,
    fontSize: 15,
  },
});
