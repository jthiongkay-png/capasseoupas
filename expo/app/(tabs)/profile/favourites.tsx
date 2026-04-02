import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { useFavourites } from '@/providers/FavouritesProvider';
import { Place, PlaceCategory } from '@/types';
import PlaceCard from '@/components/PlaceCard';
import CategoryPill from '@/components/CategoryPill';

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

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { places } = usePlaces();
  const { favouriteIds } = useFavourites();
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'refused'>('all');

  const favouritePlaces = useMemo(() => {
    let filtered = places.filter((p) => favouriteIds.includes(p.id));
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (statusFilter === 'accepted') {
      filtered = filtered.filter((p) => p.accepted);
    } else if (statusFilter === 'refused') {
      filtered = filtered.filter((p) => !p.accepted);
    }
    console.log('[Favourites] Displaying', filtered.length, 'favourite places');
    return filtered;
  }, [places, favouriteIds, selectedCategory, statusFilter]);

  const handlePlacePress = useCallback((place: Place) => {
    console.log('[Favourites] Navigating to place:', place.name);
    router.push(`/place/${place.id}` as any);
  }, [router]);

  const handleCategoryPress = useCallback((key: PlaceCategory | 'all') => {
    if (key === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory((prev) => (prev === key ? null : key));
    }
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderPlace = useCallback(({ item }: { item: Place }) => (
    <PlaceCard place={item} onPress={handlePlacePress} />
  ), [handlePlacePress]);

  const keyExtractor = useCallback((item: Place) => item.id, []);

  const listHeader = useMemo(() => (
    <View>
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
    </View>
  ), [statusFilter, selectedCategory, styles, handleCategoryPress]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]} testID="favourites-screen">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} testID="favourites-back">
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Mes favoris</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={favouritePlaces}
          renderItem={renderPlace}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Bookmark size={32} color={colors.textTertiary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Aucun favori</Text>
              <Text style={styles.emptyText}>
                Ajoutez des lieux en favoris en appuyant sur l'étoile sur la page d'un lieu.
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    textAlign: 'center' as const,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
});
