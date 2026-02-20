import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, Locate, Layers, MapPin, UtensilsCrossed, Coffee, Wine, ShoppingBag, Hotel, Fuel, ShoppingCart, Gamepad2, Heart, Bus, MoreHorizontal } from 'lucide-react-native';
import { GlassView } from 'expo-glass-effect';
import Colors from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { Place, PlaceCategory, CATEGORY_LABELS } from '@/types';
import FloatingActionButton from '@/components/FloatingActionButton';
import PlaceCard from '@/components/PlaceCard';

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

const PARIS_REGION: Region = {
  latitude: 48.8606,
  longitude: 2.3476,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { places } = usePlaces();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'refused'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const mapRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(200)).current;

  const filteredPlaces = useMemo(() => {
    let result = places;
    if (filter === 'accepted') result = result.filter((p) => p.accepted);
    else if (filter === 'refused') result = result.filter((p) => !p.accepted);
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    return result;
  }, [places, filter, selectedCategory]);

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
    if (selectedPlace) {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSelectedPlace(null));
    }
  }, [selectedPlace, slideAnim]);

  const handlePlacePress = useCallback((place: Place) => {
    router.push(`/place/${place.id}` as any);
  }, [router]);

  const handleAddReport = useCallback(() => {
    router.push('/add-report' as any);
  }, [router]);

  const handleCenterMap = useCallback(() => {
    mapRef.current?.animateToRegion(PARIS_REGION, 500);
  }, []);

  const acceptedCount = useMemo(() => places.filter((p) => p.accepted).length, [places]);
  const refusedCount = useMemo(() => places.filter((p) => !p.accepted).length, [places]);

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
              <Icon size={20} color={isSelected ? Colors.primary : Colors.textSecondary} strokeWidth={isSelected ? 2 : 1.5} />
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

  const renderAppTitle = () => (
    <View style={styles.appTitleRow}>
      <Text style={styles.appTitleJ}>J</Text>
      <Text style={styles.appTitleAmex}>amex</Text>
    </View>
  );

  const renderStatusFilters = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => setFilter('all')}
        activeOpacity={0.7}
      >
        <GlassView
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          glassEffectStyle={filter === 'all' ? 'regular' : 'clear'}
          tintColor={filter === 'all' ? Colors.primary : undefined}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            Tous ({places.length})
          </Text>
        </GlassView>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => setFilter('accepted')}
        activeOpacity={0.7}
      >
        <GlassView
          style={[styles.filterChip, filter === 'accepted' && styles.filterChipAccepted]}
          glassEffectStyle={filter === 'accepted' ? 'regular' : 'clear'}
          tintColor={filter === 'accepted' ? Colors.accepted : undefined}
        >
          <View style={[styles.filterDot, { backgroundColor: Colors.accepted }]} />
          <Text style={[styles.filterChipText, filter === 'accepted' && styles.filterChipTextActive]}>
            Accepté ({acceptedCount})
          </Text>
        </GlassView>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.filterChipWrap}
        onPress={() => setFilter('refused')}
        activeOpacity={0.7}
      >
        <GlassView
          style={[styles.filterChip, filter === 'refused' && styles.filterChipRefused]}
          glassEffectStyle={filter === 'refused' ? 'regular' : 'clear'}
          tintColor={filter === 'refused' ? Colors.refused : undefined}
        >
          <View style={[styles.filterDot, { backgroundColor: Colors.refused }]} />
          <Text style={[styles.filterChipText, filter === 'refused' && styles.filterChipTextActive]}>
            Refusé ({refusedCount})
          </Text>
        </GlassView>
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={[styles.webHeader, { paddingTop: insets.top + 8 }]}>
          {renderAppTitle()}
          {renderCategoryFilters()}
          {renderStatusFilters()}
        </View>
        <ScrollView style={styles.webList} contentContainerStyle={styles.webListContent}>
          <View style={styles.webMapNotice}>
            <MapPin size={18} color={Colors.textSecondary} strokeWidth={1.5} />
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
          initialRegion={PARIS_REGION}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {NativeMarker && filteredPlaces.map((place) => (
            <NativeMarker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              onPress={() => handleMarkerPress(place)}
              pinColor={place.accepted ? Colors.accepted : Colors.refused}
              title={place.name}
            />
          ))}
        </NativeMapView>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        {renderAppTitle()}
        {renderCategoryFilters()}
        {renderStatusFilters()}
      </View>

      <TouchableOpacity style={[styles.centerButtonWrap, { bottom: selectedPlace ? 280 : 140 }]} onPress={handleCenterMap} activeOpacity={0.8}>
        <GlassView style={styles.centerButton} glassEffectStyle="regular">
          <Locate size={20} color={Colors.primary} strokeWidth={1.5} />
        </GlassView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitleJ: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#006FCF',
  },
  appTitleAmex: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryIconWrapActive: {},
  categoryLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipAccepted: {
    backgroundColor: Colors.accepted,
    borderColor: Colors.accepted,
  },
  filterChipRefused: {
    backgroundColor: Colors.refused,
    borderColor: Colors.refused,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  centerButtonWrap: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  centerButton: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
  },
  webHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: Colors.searchBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  webMapNoticeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '400' as const,
  },
  emptyText: {
    textAlign: 'center' as const,
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 40,
  },
});
