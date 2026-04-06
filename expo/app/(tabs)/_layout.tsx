import { Tabs } from 'expo-router';
import { Map, Search, Settings } from 'lucide-react-native';
import React from 'react';
import { useThemeColors } from '@/constants/colors';

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500' as const,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="(map)"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, size }) => <Map size={size - 2} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, size }) => <Search size={size - 2} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
