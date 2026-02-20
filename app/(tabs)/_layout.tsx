import { Tabs } from 'expo-router';
import { Map, Search, Settings } from 'lucide-react-native';
import React from 'react';
import Colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500' as const,
          letterSpacing: 0.2,
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
        name="profile"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
