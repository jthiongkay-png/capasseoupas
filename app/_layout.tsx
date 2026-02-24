import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlacesProvider } from '@/providers/PlacesProvider';
import { UserProvider } from '@/providers/UserProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { useThemeColors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
        name="login"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'fade_from_bottom',
        }}
      />
      <Stack.Screen
        name="setup-username"
        options={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'fade',
          gestureEnabled: false,
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
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <LocationProvider>
            <PlacesProvider>
              <UserProvider>
                <RootLayoutNav />
              </UserProvider>
            </PlacesProvider>
          </LocationProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
