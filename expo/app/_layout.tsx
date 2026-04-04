import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlacesProvider } from '@/providers/PlacesProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { useThemeColors } from '@/constants/colors';
import ErrorBoundary from '@/components/ErrorBoundary';


void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutNav() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Retour',
        animation: Platform.OS === 'web' ? 'none' : 'fade',
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-report"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'fade_from_bottom',
        }}
      />
      <Stack.Screen
        name="place/[id]"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const requestTracking = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
        const { status } = await requestTrackingPermissionsAsync();
        console.log('[Tracking] Permission status:', status);
      } catch (error) {
        console.log('[Tracking] Error requesting permission:', error);
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await SplashScreen.hideAsync();
      await requestTracking();
    };
    void init();
  }, [requestTracking]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LocationProvider>
            <PlacesProvider>
              <RootLayoutNav />
            </PlacesProvider>
          </LocationProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
