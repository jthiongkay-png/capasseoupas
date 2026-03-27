import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const FRANCE_DEFAULT: LocationCoords = {
  latitude: 46.6034,
  longitude: 2.3488,
};

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          console.log('[Location] Geolocation not supported on this browser');
          setLocationError('Géolocalisation non supportée');
          setIsLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: LocationCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            console.log('[Location] Web location obtained:', coords);
            setUserLocation(coords);
            setPermissionGranted(true);
            setIsLoading(false);
          },
          (error) => {
            console.log('[Location] Web geolocation error:', error.message);
            setLocationError('Impossible d\'obtenir votre position');
            setIsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        const ExpoLocation = require('expo-location');
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.log('[Location] Permission denied');
          setLocationError('Permission de localisation refusée');
          setPermissionGranted(false);
          setIsLoading(false);
          return;
        }

        setPermissionGranted(true);
        const location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });

        const coords: LocationCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        console.log('[Location] Native location obtained:', coords);
        setUserLocation(coords);
        setIsLoading(false);
      }
    } catch (e) {
      console.log('[Location] Error requesting location:', e);
      setLocationError('Erreur lors de la localisation');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const getDistanceFromUser = useCallback(
    (lat: number, lng: number): number | null => {
      if (!userLocation) return null;
      const R = 6371;
      const dLat = ((lat - userLocation.latitude) * Math.PI) / 180;
      const dLon = ((lng - userLocation.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.latitude * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [userLocation]
  );

  const formatDistance = useCallback((km: number | null): string => {
    if (km === null) return '';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  }, []);

  return {
    userLocation,
    locationError,
    permissionGranted,
    isLoading,
    defaultLocation: FRANCE_DEFAULT,
    requestLocation,
    getDistanceFromUser,
    formatDistance,
  };
});
