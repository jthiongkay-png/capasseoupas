import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      <FlatList
        data={placesWithDistance}
        renderItem={renderPlace}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
});
