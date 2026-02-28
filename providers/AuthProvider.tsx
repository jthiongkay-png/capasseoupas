import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { AuthUser, AuthMethod } from '@/types';

const AUTH_KEY = 'capasseoupas_auth';
const ACCOUNTS_KEY = 'capasseoupas_accounts';

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
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) {
          console.log('[AuthProvider] Loaded auth from storage');
          return JSON.parse(stored) as AuthUser;
        }
      } catch (e) {
        console.log('[AuthProvider] Error loading auth:', e);
      }
      return null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (user: AuthUser | null) => {
      if (user) {
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(AUTH_KEY);
      }
      return user;
    },
  });

  useEffect(() => {
    if (!authQuery.isLoading) {
      setAuthUser(authQuery.data ?? null);
      setIsReady(true);
      console.log('[AuthProvider] Auth ready, user:', authQuery.data?.username ?? 'none');
    }
  }, [authQuery.data, authQuery.isLoading]);

  const getStoredAccounts = useCallback(async (): Promise<AuthUser[]> => {
    try {
      const stored = await AsyncStorage.getItem(ACCOUNTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.log('[AuthProvider] Error loading accounts:', e);
      return [];
    }
  }, []);

  const saveAccount = useCallback(async (user: AuthUser) => {
    const accounts = await getStoredAccounts();
    const idx = accounts.findIndex((a) => a.email === user.email && a.authMethod === user.authMethod);
    if (idx >= 0) {
      accounts[idx] = user;
    } else {
      accounts.push(user);
    }
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [getStoredAccounts]);

  const signUp = useCallback(async (email: string, password: string) => {
    const accounts = await getStoredAccounts();
    const existing = accounts.find((a) => a.email === email && a.authMethod === 'email');
    if (existing) {
      throw new Error('ACCOUNT_EXISTS');
    }
    const newUser: AuthUser = {
      id: generateId(),
      email,
      username: '',
      authMethod: 'email',
      password,
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      level: 'Débutant',
    };
    await saveAccount(newUser);
    setAuthUser(newUser);
    saveMutation.mutate(newUser);
    console.log('[AuthProvider] Signed up:', email);
    return newUser;
  }, [getStoredAccounts, saveAccount, saveMutation]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const accounts = await getStoredAccounts();
    const existing = accounts.find((a) => a.email === email && a.authMethod === 'email');
    if (!existing) {
      throw new Error('NO_ACCOUNT');
    }
    if (existing.password !== password) {
      throw new Error('WRONG_PASSWORD');
    }
    setAuthUser(existing);
    saveMutation.mutate(existing);
    console.log('[AuthProvider] Email sign in:', email);
    return existing;
  }, [getStoredAccounts, saveMutation]);

  const signIn = useCallback(async (email: string, method: AuthMethod) => {
    const accounts = await getStoredAccounts();
    const existing = accounts.find((a) => a.email === email && a.authMethod === method);
    if (existing) {
      setAuthUser(existing);
      saveMutation.mutate(existing);
      console.log('[AuthProvider] Social sign in (existing):', email, method);
      return existing;
    }
    const newUser: AuthUser = {
      id: generateId(),
      email,
      username: '',
      authMethod: method,
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      level: 'Débutant',
    };
    await saveAccount(newUser);
    setAuthUser(newUser);
    saveMutation.mutate(newUser);
    console.log('[AuthProvider] Signed in:', email, method);
    return newUser;
  }, [getStoredAccounts, saveAccount, saveMutation]);

  const setUsername = useCallback((username: string) => {
    setAuthUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, username };
      saveMutation.mutate(updated);
      console.log('[AuthProvider] Username set:', username);
      return updated;
    });
  }, [saveMutation]);

  const incrementReports = useCallback(() => {
    setAuthUser((prev) => {
      if (!prev) return prev;
      const newCount = prev.reportsCount + 1;
      const updated = { ...prev, reportsCount: newCount, level: getLevel(newCount) };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const signOut = useCallback(async () => {
    setAuthUser(null);
    saveMutation.mutate(null);
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    console.log('[AuthProvider] Signed out');
  }, [saveMutation, queryClient]);

  const isAuthenticated = authUser !== null;
  const hasUsername = isAuthenticated && authUser.username.length > 0;

  return {
    authUser,
    isAuthenticated,
    hasUsername,
    isReady,
    signIn,
    signUp,
    signInEmail,
    setUsername,
    incrementReports,
    signOut,
    isLoading: authQuery.isLoading,
  };
});
