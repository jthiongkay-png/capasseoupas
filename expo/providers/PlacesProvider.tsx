import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { Place, PlaceCategory, DbPlace, dbPlaceToPlace } from '@/types';
import { MOCK_PLACES } from '@/mocks/places';

export const [PlacesProvider, usePlaces] = createContextHook(() => {
  const [places, setPlaces] = useState<Place[]>([]);
  const queryClient = useQueryClient();

  const placesQuery = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('places')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.log('[PlacesProvider] Supabase error:', error.message);
          console.log('[PlacesProvider] Falling back to mock data');
          return MOCK_PLACES;
        }

        if (data && data.length > 0) {
          const mapped = (data as DbPlace[]).map(dbPlaceToPlace);
          console.log('[PlacesProvider] Loaded', mapped.length, 'places from Supabase');
          return mapped;
        }

        console.log('[PlacesProvider] No places in DB, using mock data');
        return MOCK_PLACES;
      } catch (e) {
        console.log('[PlacesProvider] Exception loading places:', e);
        return MOCK_PLACES;
      }
    },
    retry: 2,
  });

  useEffect(() => {
    if (placesQuery.data) {
      setPlaces(placesQuery.data);
    }
  }, [placesQuery.data]);

  const addPlaceMutation = useMutation({
    mutationFn: async (place: Place) => {
      const { data, error } = await supabase
        .from('places')
        .insert({
          name: place.name,
          address: place.address,
          category: place.category,
          latitude: place.latitude,
          longitude: place.longitude,
          accepted: place.accepted,
          reports_accepted: place.reportsAccepted,
          reports_refused: place.reportsRefused,
          last_report_date: place.lastReportDate,
          reported_by: place.reportedBy,
          reported_by_user_id: place.reportedByUserId ?? null,
          phone: place.phone ?? null,
          website: place.website ?? null,
        })
        .select()
        .single();

      if (error) {
        console.log('[PlacesProvider] Error adding place:', error.message);
        throw error;
      }

      const mapped = dbPlaceToPlace(data as DbPlace);
      console.log('[PlacesProvider] Place added to Supabase:', mapped.name, mapped.id);
      return mapped;
    },
    onSuccess: (newPlace) => {
      setPlaces((prev) => [newPlace, ...prev]);
      void queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ placeId, accepted }: { placeId: string; accepted: boolean }) => {
      const current = places.find((p) => p.id === placeId);
      if (!current) throw new Error('Place not found');

      const newAccepted = accepted ? current.reportsAccepted + 1 : current.reportsAccepted;
      const newRefused = accepted ? current.reportsRefused : current.reportsRefused + 1;
      const total = newAccepted + newRefused;
      const acceptRate = total > 0 ? (newAccepted / total) * 100 : 0;

      const { error } = await supabase
        .from('places')
        .update({
          reports_accepted: newAccepted,
          reports_refused: newRefused,
          accepted: acceptRate >= 90,
          last_report_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', placeId);

      if (error) {
        console.log('[PlacesProvider] Error updating report:', error.message);
        throw error;
      }

      return { placeId, newAccepted, newRefused, isAccepted: acceptRate >= 90 };
    },
    onSuccess: ({ placeId, newAccepted, newRefused, isAccepted }) => {
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === placeId
            ? {
                ...p,
                reportsAccepted: newAccepted,
                reportsRefused: newRefused,
                accepted: isAccepted,
                lastReportDate: new Date().toISOString().split('T')[0],
              }
            : p
        )
      );
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId);

      if (error) {
        console.log('[PlacesProvider] Error deleting place:', error.message);
        throw error;
      }

      console.log('[PlacesProvider] Place deleted from Supabase:', placeId);
      return placeId;
    },
    onSuccess: (placeId) => {
      setPlaces((prev) => prev.filter((p) => p.id !== placeId));
      void queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  const addPlace = useCallback((place: Place) => {
    addPlaceMutation.mutate(place);
  }, [addPlaceMutation]);

  const updatePlaceReport = useCallback((placeId: string, accepted: boolean) => {
    updateReportMutation.mutate({ placeId, accepted });
  }, [updateReportMutation]);

  const deletePlace = useCallback((placeId: string) => {
    deletePlaceMutation.mutate(placeId);
  }, [deletePlaceMutation]);

  const getPlaceById = useCallback(
    (id: string): Place | undefined => places.find((p) => p.id === id),
    [places]
  );

  return useMemo(() => ({
    places,
    isLoading: placesQuery.isLoading,
    addPlace,
    updatePlaceReport,
    deletePlace,
    getPlaceById,
  }), [places, placesQuery.isLoading, addPlace, updatePlaceReport, deletePlace, getPlaceById]);
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
