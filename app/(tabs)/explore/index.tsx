import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFilteredPlaces } from '@/providers/PlacesProvider';
import { Place, PlaceCategory, CATEGORY_LABELS } from '@/types';
import PlaceCard from '@/components/PlaceCard';
import CategoryPill from '@/components/CategoryPill';
import FloatingActionButton from '@/components/FloatingActionButton';

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

  const places = useFilteredPlaces(search, selectedCategory, statusFilter);

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

  const renderPlace = useCallback(({ item }: { item: Place }) => (
    <PlaceCard place={item} onPress={handlePlacePress} />
  ), [handlePlacePress]);

  const keyExtractor = useCallback((item: Place) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer</Text>
        <Text style={styles.subtitle}>{places.length} lieux trouvés</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des lieux ou adresses..."
            placeholderTextColor={Colors.textTertiary}
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
        data={places}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.searchBg,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400' as const,
  },
});
