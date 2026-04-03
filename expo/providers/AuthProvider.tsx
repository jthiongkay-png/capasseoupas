import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { User, Profile, profileToUser } from '@/types';
import type { Session } from '@supabase/supabase-js';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isAuthActionRef = useRef<boolean>(false);
  const queryClient = useQueryClient();

  const fetchProfile = useCallback(async (userId: string, email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('[AuthProvider] Error fetching profile:', error.message);
        return null;
      }

      const profile = data as Profile;
      const mapped = profileToUser(profile, email);
      console.log('[AuthProvider] Profile loaded for:', mapped.username);
      return mapped;
    } catch (e) {
      console.log('[AuthProvider] Exception fetching profile:', e);
      return null;
    }
  }, []);

  const fetchProfileWithRetry = useCallback(async (userId: string, email: string, maxRetries = 5): Promise<User | null> => {
    for (let i = 0; i < maxRetries; i++) {
      const profile = await fetchProfile(userId, email);
      if (profile) {
        console.log('[AuthProvider] Profile fetched on attempt', i + 1);
        return profile;
      }
      console.log('[AuthProvider] Profile not ready, retrying in', (i + 1) * 500, 'ms...');
      await new Promise((resolve) => setTimeout(resolve, (i + 1) * 500));
    }
    console.log('[AuthProvider] Profile not found after retries');
    return null;
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[AuthProvider] Initial session:', currentSession ? 'found' : 'none');

        if (currentSession?.user && mounted) {
          setSession(currentSession);
          const profile = await fetchProfile(
            currentSession.user.id,
            currentSession.user.email ?? ''
          );
          if (mounted) {
            setUser(profile);
          }
        }
      } catch (e) {
        console.log('[AuthProvider] Init error:', e);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, 'isAuthAction:', isAuthActionRef.current);

      if (!mounted) return;

      setSession(newSession);

      if (isAuthActionRef.current) {
        console.log('[AuthProvider] Skipping onAuthStateChange profile fetch - active auth action handles it');
        return;
      }

      if (newSession?.user) {
        const profile = await fetchProfileWithRetry(
          newSession.user.id,
          newSession.user.email ?? '',
          3
        );
        if (mounted && !isAuthActionRef.current) {
          setUser(profile);
          setIsLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchProfileWithRetry]);

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string) => {
    console.log('[AuthProvider] Signing up with email:', email);
    isAuthActionRef.current = true;

    try {
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username.trim());

      if (existingProfiles && existingProfiles.length > 0) {
        throw new Error('Ce nom d\'utilisateur est déjà pris.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            auth_method: 'email',
          },
        },
      });

      if (error) {
        console.log('[AuthProvider] Signup error:', error.message);
        if (error.message.includes('already registered')) {
          throw new Error('Un compte existe déjà avec cette adresse e-mail.');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('[AuthProvider] Signup successful, user id:', data.user.id);
        const profile = await fetchProfileWithRetry(data.user.id, data.user.email ?? email, 8);
        if (profile) {
          setUser(profile);
          console.log('[AuthProvider] Profile set after signup:', profile.username);
        } else {
          console.log('[AuthProvider] WARNING: Profile not found after signup retries');
        }
        void queryClient.invalidateQueries({ queryKey: ['auth'] });
        return profile;
      }

      return null;
    } finally {
      isAuthActionRef.current = false;
    }
  }, [fetchProfileWithRetry, queryClient]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    console.log('[AuthProvider] Signing in with email:', email);
    isAuthActionRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.log('[AuthProvider] Sign in error:', error.message);
        throw new Error('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
      }

      if (data.user) {
        console.log('[AuthProvider] Sign in successful');
        const profile = await fetchProfileWithRetry(data.user.id, data.user.email ?? email, 5);
        if (profile) {
          setUser(profile);
          console.log('[AuthProvider] Profile set after login:', profile.username);
        }
        void queryClient.invalidateQueries({ queryKey: ['auth'] });
        return profile;
      }

      return null;
    } finally {
      isAuthActionRef.current = false;
    }
  }, [fetchProfileWithRetry, queryClient]);

  const signInWithApple = useCallback(async (_username: string) => {
    console.log('[AuthProvider] Apple sign-in requested (placeholder)');
    throw new Error('La connexion Apple nécessite une configuration supplémentaire. Utilisez l\'e-mail pour l\'instant.');
  }, []);

  const signInWithGoogle = useCallback(async (_username: string) => {
    console.log('[AuthProvider] Google sign-in requested (placeholder)');
    throw new Error('La connexion Google nécessite une configuration supplémentaire. Utilisez l\'e-mail pour l\'instant.');
  }, []);

  const signOut = useCallback(async () => {
    console.log('[AuthProvider] Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('[AuthProvider] Sign out error:', error.message);
    }
    setUser(null);
    setSession(null);
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    console.log('[AuthProvider] Signed out');
  }, [queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    console.log('[AuthProvider] Requesting password reset for:', email);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      { redirectTo: undefined }
    );

    if (error) {
      console.log('[AuthProvider] Reset password error:', error.message);
      throw new Error('Une erreur est survenue lors de l\'envoi du lien de réinitialisation.');
    }

    console.log('[AuthProvider] Password reset email sent');
    return true;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    console.log('[AuthProvider] Updating password');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.log('[AuthProvider] Update password error:', error.message);
      throw new Error('Erreur lors de la mise à jour du mot de passe.');
    }

    console.log('[AuthProvider] Password updated');
  }, []);

  const incrementReports = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_reports_count', {
        user_uuid: user.id,
      });

      if (error) {
        console.log('[AuthProvider] Increment reports error:', error.message);
        return;
      }

      const profile = await fetchProfile(user.id, user.email);
      if (profile) {
        setUser(profile);
      }
      console.log('[AuthProvider] Reports count incremented');
    } catch (e) {
      console.log('[AuthProvider] Exception incrementing reports:', e);
    }
  }, [user, fetchProfile]);

  const updateUsername = useCallback(async (username: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (error) {
        console.log('[AuthProvider] Update username error:', error.message);
        throw new Error('Erreur lors de la mise à jour du nom d\'utilisateur.');
      }

      setUser((prev) => prev ? { ...prev, username: username.trim() } : prev);
      console.log('[AuthProvider] Username updated to:', username.trim());
    } catch (e) {
      console.log('[AuthProvider] Exception updating username:', e);
      throw e;
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const profile = await fetchProfile(session.user.id, session.user.email ?? '');
    if (profile) {
      setUser(profile);
    }
  }, [session, fetchProfile]);

  return useMemo(() => ({
    user,
    session,
    isAuthenticated: !!user && !!session,
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
    refreshProfile,
  }), [user, session, isLoading, signUpWithEmail, signInWithEmail, signInWithApple, signInWithGoogle, signOut, resetPassword, updatePassword, incrementReports, updateUsername, refreshProfile]);
});
