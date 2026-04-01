import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types';

const AUTH_KEY = 'capasseoupas_auth';
const USERS_KEY = 'capasseoupas_users';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getLevel(count: number): string {
  if (count >= 50) return 'Ambassadeur';
  if (count >= 25) return 'Expert';
  if (count >= 10) return 'Contributeur';
  if (count >= 3) return 'Explorateur';
  return 'Débutant';
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          console.log('[AuthProvider] Loaded authenticated user:', parsed.username);
          return parsed;
        }
      } catch (e) {
        console.log('[AuthProvider] Error loading auth:', e);
      }
      return null;
    },
  });

  useEffect(() => {
    if (authQuery.isFetched) {
      setUser(authQuery.data ?? null);
      setIsLoading(false);
    }
  }, [authQuery.data, authQuery.isFetched]);

  const saveMutation = useMutation({
    mutationFn: async (updatedUser: User) => {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      const usersRaw = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      const idx = users.findIndex((u) => u.id === updatedUser.id);
      if (idx >= 0) {
        users[idx] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      return updatedUser;
    },
  });

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string) => {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Un compte existe déjà avec cette adresse e-mail.');
    }
    const usernameExists = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      throw new Error('Ce nom d\'utilisateur est déjà pris.');
    }

    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password,
      authMethod: 'email',
      reportsCount: 0,
      joinDate: new Date().toISOString().split('T')[0],
      level: 'Débutant',
    };

    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    console.log('[AuthProvider] Signed up with email:', email);
    return newUser;
  }, [queryClient]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );
    if (!found) {
      throw new Error('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
    }
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(found));
    setUser(found);
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    console.log('[AuthProvider] Signed in with email:', email);
    return found;
  }, [queryClient]);

  const signInWithApple = useCallback(async (username: string) => {
    const appleId = 'apple_' + generateId();
    const newUser: User = {
      id: appleId,
      email: `${appleId}@privaterelay.appleid.com`,
      username: username.trim(),
      authMethod: 'apple',
      reportsCount: 0,
      joinDate: new Date().toISOString().split('T')[0],
      level: 'Débutant',
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    console.log('[AuthProvider] Signed in with Apple');
    return newUser;
  }, [queryClient]);

  const signInWithGoogle = useCallback(async (username: string) => {
    const googleId = 'google_' + generateId();
    const newUser: User = {
      id: googleId,
      email: `${googleId}@gmail.com`,
      username: username.trim(),
      authMethod: 'google',
      reportsCount: 0,
      joinDate: new Date().toISOString().split('T')[0],
      level: 'Débutant',
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    console.log('[AuthProvider] Signed in with Google');
    return newUser;
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    console.log('[AuthProvider] Signed out');
  }, [queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      throw new Error('Aucun compte trouvé avec cette adresse e-mail.');
    }
    console.log('[AuthProvider] Password reset requested for:', email);
    return true;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!user) return;
    const updated = { ...user, password: newPassword };
    setUser(updated);
    saveMutation.mutate(updated);
    console.log('[AuthProvider] Password updated');
  }, [user, saveMutation]);

  const incrementReports = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const newCount = prev.reportsCount + 1;
      const updated = { ...prev, reportsCount: newCount, level: getLevel(newCount) };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const updateUsername = useCallback((username: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, username };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    signInWithApple,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    incrementReports,
    updateUsername,
  }), [user, isLoading, signUpWithEmail, signInWithEmail, signInWithApple, signInWithGoogle, signOut, resetPassword, updatePassword, incrementReports, updateUsername]);
});
