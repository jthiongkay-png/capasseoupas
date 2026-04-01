import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signUpWithEmail, signInWithApple, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'apple' | 'google' | null>(null);
  const [usernameStep, setUsernameStep] = useState(false);

  const handleEmailSignup = useCallback(async () => {
    if (!email.trim() || !password || !username.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mots de passe différents', 'Les mots de passe ne correspondent pas.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('E-mail invalide', 'Veuillez entrer une adresse e-mail valide.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, username.trim());
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/(map)' as never);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, username, signUpWithEmail, router]);

  const handleSocialSignup = useCallback(async (method: 'apple' | 'google') => {
    if (!username.trim()) {
      Alert.alert('Nom d\'utilisateur requis', 'Veuillez choisir un nom d\'utilisateur.');
      return;
    }
    setLoading(true);
    try {
      if (method === 'apple') {
        await signInWithApple(username.trim());
      } else {
        await signInWithGoogle(username.trim());
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/(map)' as never);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [username, signInWithApple, signInWithGoogle, router]);

  const handleSocialPress = useCallback((method: 'apple' | 'google') => {
    setAuthMethod(method);
    setUsernameStep(true);
  }, []);

  if (usernameStep && authMethod) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setUsernameStep(false)} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Choisissez un pseudo</Text>
            <Text style={styles.subtitle}>
              {authMethod === 'apple' ? 'Connexion avec Apple' : 'Connexion avec Google'}
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <User size={18} color={colors.textTertiary} strokeWidth={1.5} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor={colors.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                testID="signup-username-social"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={() => handleSocialSignup(authMethod as 'apple' | 'google')}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Continuer</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté Capasseoupas</Text>

          <View style={styles.socialButtons}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('apple')} activeOpacity={0.7}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('google')} activeOpacity={0.7}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou par e-mail</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <User size={18} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nom d'utilisateur"
              placeholderTextColor={colors.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              testID="signup-username"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Mail size={18} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Adresse e-mail"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="signup-email"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Lock size={18} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe (min. 6 caractères)"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              testID="signup-password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              {showPassword ? (
                <EyeOff size={18} color={colors.textTertiary} strokeWidth={1.5} />
              ) : (
                <Eye size={18} color={colors.textTertiary} strokeWidth={1.5} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Lock size={18} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              testID="signup-confirm-password"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailSignup}
            activeOpacity={0.8}
            disabled={loading}
            testID="signup-submit"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  socialButtons: {
    gap: 10,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 8,
  },
  primaryButton: {
    backgroundColor: '#006FCF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
