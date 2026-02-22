import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated, Dimensions, ScrollView, TextInput, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, Locate, Layers, MapPin, UtensilsCrossed, Coffee, Wine, ShoppingBag, Hotel, Fuel, ShoppingCart, Gamepad2, Heart, Bus, MoreHorizontal, Search, X, ListFilter } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useFilteredPlaces } from '@/providers/PlacesProvider';
import { Place, PlaceCategory, CATEGORY_LABELS } from '@/types';
import FloatingActionButton from '@/components/FloatingActionButton';
import PlaceCard from '@/components/PlaceCard';
import { useLocation } from '@/providers/LocationProvider';

let NativeMapView: any = null;
let NativeMarker: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  NativeMapView = Maps.default;
  NativeMarker = Maps.Marker;
}

const { width } = Dimensions.get('window');

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'accepted' | 'refused'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);

  const allPlaces = useFilteredPlaces('', null, 'all');
  const filteredPlaces = useFilteredPlaces(searchQuery, selectedCategory, filter);
  const { userLocation, isLoading: locationLoading, requestLocation } = useLocation();
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

  useEffect(() => {
    if (userLocation && mapRef.current && !hasAnimatedToUser.current) {
      hasAnimatedToUser.current = true;
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        600
      );
    }
  }, [userLocation]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(200)).current;
  const searchInputRef = useRef<TextInput>(null);

  const handleCategoryPress = useCallback((cat: PlaceCategory) => {
    setSelectedCategory((prev) => (prev === cat ? null : cat));
  }, []);

  const handleMarkerPress = useCallback((place: Place) => {
    setSelectedPlace(place);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleMapPress = useCallback(() => {
    Keyboard.dismiss();
    if (selectedPlace) {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSelectedPlace(null));
    }
  }, [selectedPlace, slideAnim]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.blur();
  }, []);

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
      requestLocation();
      mapRef.current?.animateToRegion(DEFAULT_REGION, 500);
    }
  }, [userLocation, requestLocation]);

  const acceptedCount = useMemo(() => allPlaces.filter((p) => p.accepted).length, [allPlaces]);
  const refusedCount = useMemo(() => allPlaces.filter((p) => !p.accepted).length, [allPlaces]);

  const renderCategoryFilters = () => (
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
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(cat)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIconWrap, isSelected && styles.categoryIconWrapActive]}>
              <Icon size={20} color={isSelected ? colors.primary : colors.textSecondary} strokeWidth={isSelected ? 2 : 1.5} />
            </View>
            <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
              {CATEGORY_LABELS[cat]}
            </Text>
            {isSelected && <View style={styles.categoryUnderline} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textTertiary} strokeWidth={1.5} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Rechercher un lieu ou adresse..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
          testID="map-search-input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={styles.clearButton}>
              <X size={14} color={colors.textTertiary} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStatusFilters = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => { setFilter('all'); Keyboard.dismiss(); }}
        activeOpacity={0.7}
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
      >
        <View style={[styles.filterChip, filter === 'refused' && styles.filterChipRefused]}>
          <XCircle size={13} color={filter === 'refused' ? '#FFFFFF' : colors.refused} strokeWidth={2} />
          <Text style={[styles.filterChipText, filter === 'refused' && styles.filterChipTextActive]}>
            Refusé ({refusedCount})
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={[styles.webHeader, { paddingTop: insets.top + 8 }]}>
          {renderSearchBar()}
          {renderCategoryFilters()}
          {renderStatusFilters()}
        </View>
        <ScrollView style={styles.webList} contentContainerStyle={styles.webListContent}>
          <View style={styles.webMapNotice}>
            <MapPin size={18} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.webMapNoticeText}>La carte est disponible sur l'application mobile</Text>
          </View>
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onPress={handlePlacePress} compact={false} />
          ))}
          {filteredPlaces.length === 0 && (
            <Text style={styles.emptyText}>Aucun lieu trouvé</Text>
          )}
        </ScrollView>
        <FloatingActionButton onPress={handleAddReport} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {NativeMapView && (
        <NativeMapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {NativeMarker && filteredPlaces.map((place) => (
            <NativeMarker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              onPress={() => handleMarkerPress(place)}
              pinColor={place.accepted ? colors.accepted : colors.refused}
              title={place.name}
            />
          ))}
        </NativeMapView>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        {renderSearchBar()}
        {renderCategoryFilters()}
        {renderStatusFilters()}
      </View>

      <TouchableOpacity style={[styles.centerButtonWrap, { bottom: selectedPlace ? 280 : 94 }]} onPress={handleCenterMap} activeOpacity={0.8}>
        <View style={styles.centerButton}>
          <Locate size={20} color={colors.primary} strokeWidth={1.5} />
        </View>
      </TouchableOpacity>

      {selectedPlace && (
        <Animated.View style={[styles.selectedCard, { transform: [{ translateY: slideAnim }] }]}>
          <PlaceCard place={selectedPlace} onPress={handlePlacePress} compact={false} />
        </Animated.View>
      )}

      <FloatingActionButton onPress={handleAddReport} />
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
  searchContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingRight: 20,
    gap: 20,
    paddingBottom: 2,
  },
  categoryItem: {
    alignItems: 'center',
    paddingBottom: 8,
    minWidth: 56,
    position: 'relative' as const,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconWrapActive: {},
  categoryLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOpacity: 0.1,
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
    bottom: 90,
    left: 0,
    right: 0,
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
  emptyText: {
    textAlign: 'center' as const,
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 40,
  },
});
