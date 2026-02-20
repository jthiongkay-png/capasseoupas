import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types';

const USER_KEY = 'capasseoupas_user';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const DEFAULT_USER: User = {
  id: generateId(),
  username: 'Explorateur',
  reportsCount: 0,
  joinDate: new Date().toISOString().split('T')[0],
  level: 'Débutant',
};

function getLevel(count: number): string {
  if (count >= 50) return 'Ambassadeur';
  if (count >= 25) return 'Expert';
  if (count >= 10) return 'Contributeur';
  if (count >= 3) return 'Explorateur';
  return 'Débutant';
}

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) {
          console.log('[UserProvider] Loaded user from storage');
          return JSON.parse(stored) as User;
        }
      } catch (e) {
        console.log('[UserProvider] Error loading user:', e);
      }
      console.log('[UserProvider] Using default user');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedUser: User) => {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    },
  });

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  const incrementReports = useCallback(() => {
    setUser((prev) => {
      const newCount = prev.reportsCount + 1;
      const updated = { ...prev, reportsCount: newCount, level: getLevel(newCount) };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const updateUsername = useCallback((username: string) => {
    setUser((prev) => {
      const updated = { ...prev, username };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  return { user, incrementReports, updateUsername, isLoading: userQuery.isLoading };
});
