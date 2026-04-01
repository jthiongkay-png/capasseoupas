import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

const FAVOURITES_KEY = 'capasseoupas_favourites';

export const [FavouritesProvider, useFavourites] = createContextHook(() => {
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  const favQuery = useQuery({
    queryKey: ['favourites'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVOURITES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          console.log('[FavouritesProvider] Loaded', parsed.length, 'favourites');
          return parsed;
        }
      } catch (e) {
        console.log('[FavouritesProvider] Error loading favourites:', e);
      }
      return [] as string[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids));
      return ids;
    },
  });

  useEffect(() => {
    if (favQuery.data) {
      setFavouriteIds(favQuery.data);
    }
  }, [favQuery.data]);

  const toggleFavourite = useCallback((placeId: string) => {
    setFavouriteIds((prev) => {
      const exists = prev.includes(placeId);
      const updated = exists ? prev.filter((id) => id !== placeId) : [...prev, placeId];
      saveMutation.mutate(updated);
      console.log('[FavouritesProvider]', exists ? 'Removed' : 'Added', 'favourite:', placeId);
      return updated;
    });
  }, [saveMutation]);

  const isFavourite = useCallback((placeId: string) => {
    return favouriteIds.includes(placeId);
  }, [favouriteIds]);

  return useMemo(() => ({
    favouriteIds,
    toggleFavourite,
    isFavourite,
    isLoading: favQuery.isLoading,
  }), [favouriteIds, toggleFavourite, isFavourite, favQuery.isLoading]);
});
