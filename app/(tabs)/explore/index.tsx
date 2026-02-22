import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Navigation, MapPin } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useFilteredPlaces } from '@/providers/PlacesProvider';
import { Place, PlaceCategory, CATEGORY_LABELS } from '@/types';
import PlaceCard from '@/components/PlaceCard';
import CategoryPill from '@/components/CategoryPill';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useLocation } from '@/providers/LocationProvider';

const CATEGORIES: { key: PlaceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'cafe', label: 'Café' },
  { key: 'bar', label: 'Bar' },
  { key: 'shop', label: 'Shopping' },
  { key: 'hotel', label: 'Hôtel' },
  { key: 'grocery', label: 'Épicerie' },
  { key: 'gas_station', label: 'Station' },
  { key: 'entertainment', label: 'Loisirs' },
  { key: 'health', label: 'Santé' },
  { key: 'transport', label: 'Transport' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'refused'>('all');
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const places = useFilteredPlaces(search, selectedCategory, statusFilter);
  const { getDistanceFromUser, formatDistance, userLocation } = useLocation();

  const placesWithDistance = useMemo(() => {
    return places
      .map((p) => ({
        place: p,
        distance: getDistanceFromUser(p.latitude, p.longitude),
      }))
      .sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [places, getDistanceFromUser]);

  const handlePlacePress = useCallback((place: Place) => {
    router.push(`/place/${place.id}` as any);
  }, [router]);

  const handleAddReport = useCallback(() => {
    router.push('/add-report' as any);
  }, [router]);

  const handleCategoryPress = useCallback((key: PlaceCategory | 'all') => {
    if (key === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory((prev) => (prev === key ? null : key));
    }
  }, []);

  const renderPlace = useCallback(({ item }: { item: { place: Place; distance: number | null } }) => (
    <PlaceCard place={item.place} onPress={handlePlacePress} distance={formatDistance(item.distance)} />
  ), [handlePlacePress, formatDistance]);

  const keyExtractor = useCallback((item: { place: Place; distance: number | null }) => item.place.id, []);

  const listHeader = useMemo(() => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer</Text>
        <Text style={styles.subtitle}>{placesWithDistance.length} lieux trouvés{userLocation ? ' · triés par distance' : ''}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textTertiary} strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des lieux ou adresses..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            testID="search-input"
          />
        </View>
      </View>

      <View style={styles.statusRow}>
        {(['all', 'accepted', 'refused'] as const).map((status) => (
          <CategoryPill
            key={status}
            label={status === 'all' ? 'Tous' : status === 'accepted' ? 'Accepté' : 'Refusé'}
            selected={statusFilter === status}
            onPress={() => setStatusFilter(status)}
          />
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={styles.categoryBar}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.key}
            label={cat.label}
            selected={cat.key === 'all' ? selectedCategory === null : selectedCategory === cat.key}
            onPress={() => handleCategoryPress(cat.key)}
          />
        ))}
      </ScrollView>

      {userLocation && placesWithDistance.length > 0 && placesWithDistance[0].distance !== null && (
        <TouchableOpacity
          style={styles.closestCard}
          onPress={() => handlePlacePress(placesWithDistance[0].place)}
          activeOpacity={0.8}
        >
          <View style={styles.closestBadge}>
            <Navigation size={14} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.closestBadgeText}>Le plus proche</Text>
          </View>
          <View style={styles.closestContent}>
            <View style={styles.closestInfo}>
              <Text style={styles.closestName} numberOfLines={1}>{placesWithDistance[0].place.name}</Text>
              <Text style={styles.closestAddress} numberOfLines={1}>{placesWithDistance[0].place.address}</Text>
            </View>
            <View style={styles.closestDistanceWrap}>
              <MapPin size={14} color={colors.filterActive} strokeWidth={2} />
              <Text style={styles.closestDistance}>{formatDistance(placesWithDistance[0].distance)}</Text>
            </View>
          </View>
          <View style={[styles.closestStatusDot, { backgroundColor: placesWithDistance[0].place.accepted ? colors.accepted : colors.refused }]} />
        </TouchableOpacity>
      )}
    </View>
  ), [placesWithDistance, userLocation, search, statusFilter, selectedCategory, colors, styles, formatDistance, handlePlacePress, handleCategoryPress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={placesWithDistance}
        renderItem={renderPlace}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Aucun lieu trouvé</Text>
            <Text style={styles.emptyText}>Essayez de modifier vos filtres ou termes de recherche</Text>
          </View>
        }
      />

      <FloatingActionButton onPress={handleAddReport} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '400' as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  categoryBar: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 0,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400' as const,
  },
  closestCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.filterActive,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative' as const,
  },
  closestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.filterActive,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  closestBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  closestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closestInfo: {
    flex: 1,
    marginRight: 12,
  },
  closestName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  closestAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  closestDistanceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.searchBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closestDistance: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.filterActive,
  },
  closestStatusDot: {
    position: 'absolute' as const,
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
