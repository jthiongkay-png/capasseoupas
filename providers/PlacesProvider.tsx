import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Place, PlaceCategory } from '@/types';
import { MOCK_PLACES } from '@/mocks/places';

const STORAGE_KEY = 'capasseoupas_places';

export const [PlacesProvider, usePlaces] = createContextHook(() => {
  const [places, setPlaces] = useState<Place[]>([]);
  const queryClient = useQueryClient();

  const placesQuery = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Place[];
          console.log('[PlacesProvider] Loaded', parsed.length, 'places from storage');
          return parsed;
        }
      } catch (e) {
        console.log('[PlacesProvider] Error loading places:', e);
      }
      console.log('[PlacesProvider] Using mock places');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PLACES));
      return MOCK_PLACES;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedPlaces: Place[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaces));
      return updatedPlaces;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  useEffect(() => {
    if (placesQuery.data) {
      setPlaces(placesQuery.data);
    }
  }, [placesQuery.data]);

  const addPlace = useCallback((place: Place) => {
    setPlaces((prev) => {
      const updated = [place, ...prev];
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const updatePlaceReport = useCallback((placeId: string, accepted: boolean) => {
    setPlaces((prev) => {
      const updated = prev.map((p) => {
        if (p.id === placeId) {
          const newAccepted = accepted ? p.reportsAccepted + 1 : p.reportsAccepted;
          const newRefused = accepted ? p.reportsRefused : p.reportsRefused + 1;
          return {
            ...p,
            reportsAccepted: newAccepted,
            reportsRefused: newRefused,
            accepted: newAccepted >= newRefused,
            lastReportDate: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      });
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const getPlaceById = useCallback(
    (id: string): Place | undefined => places.find((p) => p.id === id),
    [places]
  );

  return {
    places,
    isLoading: placesQuery.isLoading,
    addPlace,
    updatePlaceReport,
    getPlaceById,
  };
});

export function useFilteredPlaces(search: string, category: PlaceCategory | null, statusFilter: 'all' | 'accepted' | 'refused') {
  const { places } = usePlaces();
  return useMemo(() => {
    let filtered = places;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (statusFilter === 'accepted') {
      filtered = filtered.filter((p) => p.accepted);
    } else if (statusFilter === 'refused') {
      filtered = filtered.filter((p) => !p.accepted);
    }
    return filtered;
  }, [places, search, category, statusFilter]);
}
