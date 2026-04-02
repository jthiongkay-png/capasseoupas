import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { DbFavourite } from '@/types';

export const [FavouritesProvider, useFavourites] = createContextHook(() => {
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favQuery = useQuery({
    queryKey: ['favourites', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[FavouritesProvider] No user, returning empty favourites');
        return [] as string[];
      }

      try {
        const { data, error } = await supabase
          .from('favourites')
          .select('place_id')
          .eq('user_id', user.id);

        if (error) {
          console.log('[FavouritesProvider] Supabase error:', error.message);
          return [] as string[];
        }

        const ids = (data as Pick<DbFavourite, 'place_id'>[]).map((f) => f.place_id);
        console.log('[FavouritesProvider] Loaded', ids.length, 'favourites from Supabase');
        return ids;
      } catch (e) {
        console.log('[FavouritesProvider] Exception loading favourites:', e);
        return [] as string[];
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (favQuery.data) {
      setFavouriteIds(favQuery.data);
    }
  }, [favQuery.data]);

  useEffect(() => {
    if (!user) {
      setFavouriteIds([]);
    }
  }, [user]);

  const addFavMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('favourites')
        .insert({ user_id: user.id, place_id: placeId });

      if (error) {
        console.log('[FavouritesProvider] Error adding favourite:', error.message);
        throw error;
      }

      console.log('[FavouritesProvider] Added favourite:', placeId);
      return placeId;
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (error) {
        console.log('[FavouritesProvider] Error removing favourite:', error.message);
        throw error;
      }

      console.log('[FavouritesProvider] Removed favourite:', placeId);
      return placeId;
    },
  });

  const toggleFavourite = useCallback((placeId: string) => {
    const exists = favouriteIds.includes(placeId);

    if (exists) {
      setFavouriteIds((prev) => prev.filter((id) => id !== placeId));
      removeFavMutation.mutate(placeId, {
        onError: () => {
          setFavouriteIds((prev) => [...prev, placeId]);
          void queryClient.invalidateQueries({ queryKey: ['favourites'] });
        },
      });
    } else {
      setFavouriteIds((prev) => [...prev, placeId]);
      addFavMutation.mutate(placeId, {
        onError: () => {
          setFavouriteIds((prev) => prev.filter((id) => id !== placeId));
          void queryClient.invalidateQueries({ queryKey: ['favourites'] });
        },
      });
    }
  }, [favouriteIds, addFavMutation, removeFavMutation, queryClient]);

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
