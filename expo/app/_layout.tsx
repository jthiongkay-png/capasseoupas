import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlacesProvider } from '@/providers/PlacesProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { FavouritesProvider } from '@/providers/FavouritesProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { useThemeColors } from '@/constants/colors';
import ErrorBoundary from '@/components/ErrorBoundary';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password';

    if (!isAuthenticated && !inAuthGroup) {
      console.log('[Auth] Not authenticated, redirecting to welcome');
      router.replace('/welcome' as never);
    } else if (isAuthenticated && inAuthGroup) {
      console.log('[Auth] Authenticated, redirecting to tabs');
      router.replace('/(tabs)/(map)' as never);
    }
  }, [isAuthenticated, isLoading, segments, router]);
}

function RootLayoutNav() {
  const colors = useThemeColors();
  useProtectedRoute();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Retour',
        animation: Platform.OS === 'web' ? 'none' : 'fade',
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
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
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LocationProvider>
            <PlacesProvider>
              <AuthProvider>
                <FavouritesProvider>
                  <RootLayoutNav />
                </FavouritesProvider>
              </AuthProvider>
            </PlacesProvider>
          </LocationProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
