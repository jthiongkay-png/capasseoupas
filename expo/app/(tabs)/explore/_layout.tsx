import { Stack } from 'expo-router';
import React from 'react';
import { useThemeColors } from '@/constants/colors';

export default function ExploreLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
