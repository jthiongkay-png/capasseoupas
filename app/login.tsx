import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Animated, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Mail, X, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { AuthMethod } from '@/types';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, signUp, signInEmail } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showEmail = useCallback(() => {
    setShowEmailInput(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [fadeAnim]);

  const handleSocialLogin = useCallback(async (method: AuthMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const fakeEmail = method === 'google' ? 'user@gmail.com' : 'user@icloud.com';
      await signIn(fakeEmail, method);
      console.log('[Login] Social login success:', method);
      router.replace('/setup-username' as any);
    } catch (e) {
      console.log('[Login] Social login error:', e);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [signIn, router]);

  const validatePassword = useCallback((pwd: string): string | null => {
    if (pwd.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (!/[A-Z]/.test(pwd)) return 'Le mot de passe doit contenir au moins une majuscule.';
    if (!/[0-9]/.test(pwd)) return 'Le mot de passe doit contenir au moins un chiffre.';
    return null;
  }, []);

  const handleEmailLogin = useCallback(async () => {
    Keyboard.dismiss();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }
    if (!password) {
      Alert.alert('Mot de passe requis', 'Veuillez entrer votre mot de passe.');
      return;
    }

    if (isSignUp) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        Alert.alert('Mot de passe faible', pwdError);
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      let user;
      if (isSignUp) {
        user = await signUp(trimmed, password);
        console.log('[Login] Email sign up success:', trimmed);
      } else {
        user = await signInEmail(trimmed, password);
        console.log('[Login] Email sign in success:', trimmed);
      }
      if (user.username && user.username.length > 0) {
        router.replace('/(tabs)/(map)' as any);
      } else {
        router.replace('/setup-username' as any);
      }
    } catch (e: any) {
      console.log('[Login] Email auth error:', e);
      if (e?.message === 'ACCOUNT_EXISTS') {
        Alert.alert('Compte existant', 'Un compte avec cet email existe déjà. Connectez-vous à la place.', [
          { text: 'Se connecter', onPress: () => setIsSignUp(false) },
          { text: 'Annuler', style: 'cancel' },
        ]);
      } else if (e?.message === 'NO_ACCOUNT') {
        Alert.alert('Aucun compte', 'Aucun compte trouvé avec cet email. Créez-en un.', [
          { text: "S'inscrire", onPress: () => setIsSignUp(true) },
          { text: 'Annuler', style: 'cancel' },
        ]);
      } else if (e?.message === 'WRONG_PASSWORD') {
        Alert.alert('Mot de passe incorrect', 'Le mot de passe est incorrect. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, isSignUp, signUp, signInEmail, router, validatePassword]);

  const toggleMode = useCallback(() => {
    setIsSignUp((prev) => !prev);
    setPassword('');
    setConfirmPassword('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const isEmailFormValid = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) return false;
    if (!password) return false;
    if (isSignUp && password !== confirmPassword) return false;
    return true;
  }, [email, password, confirmPassword, isSignUp]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>

          <View style={styles.heroArea}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <CreditCard size={32} color="#006FCF" strokeWidth={1.5} />
              </View>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.titleAccent}>C</Text>
              <Text style={styles.titleRest}>apasseoupas</Text>
            </View>
            <Text style={styles.subtitle}>
              Connectez-vous pour signaler des commerces et aider la communauté Amex
            </Text>
          </View>

          <View style={styles.buttonsArea}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={() => handleSocialLogin('apple')}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.appleIcon}>&#63743;</Text>
                <Text style={[styles.socialButtonText, styles.appleText]}>Continuer avec Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialLogin('google')}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.socialButtonText, styles.googleText]}>Continuer avec Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {!showEmailInput ? (
              <TouchableOpacity
                style={[styles.socialButton, styles.emailButton]}
                onPress={showEmail}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Mail size={18} color={colors.textPrimary} strokeWidth={1.5} />
                <Text style={[styles.socialButtonText, styles.emailText]}>Continuer avec Email</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View style={[styles.emailInputArea, { opacity: fadeAnim }]}>
                <Text style={styles.emailModeTitle}>
                  {isSignUp ? 'Créer un compte' : 'Se connecter'}
                </Text>
                <TextInput
                  style={styles.emailInput}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  testID="input-email"
                />
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Mot de passe"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="input-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((p) => !p)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textTertiary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} color={colors.textTertiary} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>
                </View>
                {isSignUp && (
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor={colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="input-confirm-password"
                  />
                )}
                {isSignUp && password.length > 0 && (
                  <View style={styles.passwordHints}>
                    <Text style={[styles.hintText, password.length >= 8 && styles.hintValid]}>
                      • 8 caractères minimum {password.length >= 8 ? '✓' : ''}
                    </Text>
                    <Text style={[styles.hintText, /[A-Z]/.test(password) && styles.hintValid]}>
                      • Une majuscule {/[A-Z]/.test(password) ? '✓' : ''}
                    </Text>
                    <Text style={[styles.hintText, /[0-9]/.test(password) && styles.hintValid]}>
                      • Un chiffre {/[0-9]/.test(password) ? '✓' : ''}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.emailSubmitFull, (!isEmailFormValid || isLoading) && styles.emailSubmitDisabled]}
                  onPress={handleEmailLogin}
                  activeOpacity={0.8}
                  disabled={!isEmailFormValid || isLoading}
                >
                  <Text style={styles.emailSubmitText}>
                    {isLoading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
                  </Text>
                  {!isLoading && <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleMode} activeOpacity={0.7} style={styles.toggleRow}>
                  <Text style={styles.toggleText}>
                    {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
                    <Text style={styles.toggleLink}>
                      {isSignUp ? 'Se connecter' : "S'inscrire"}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          <View style={styles.legalArea}>
            <Text style={styles.legalText}>
              En continuant, vous acceptez nos{' '}
              <Text style={styles.legalLink} onPress={() => router.push('/terms' as never)}>
                Conditions d'utilisation
              </Text>
              {' '}et notre{' '}
              <Text style={styles.legalLink} onPress={() => router.push('/privacy' as never)}>
                Politique de confidentialité
              </Text>
              .
            </Text>
            <Text style={styles.adDisclosure}>
              Cette application utilise des publicités personnalisées. Vos données peuvent être utilisées à des fins publicitaires.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#006FCF',
  },
  titleRest: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonsArea: {
    gap: 12,
    paddingBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appleIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  appleText: {
    color: '#FFFFFF',
  },
  googleText: {
    color: colors.textPrimary,
  },
  emailText: {
    color: colors.textPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 2,
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
  emailInputArea: {
    gap: 10,
  },
  emailModeTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  emailInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  passwordHints: {
    gap: 2,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textTertiary,
  },
  hintValid: {
    color: '#34C759',
  },
  emailSubmitFull: {
    backgroundColor: '#006FCF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  emailSubmitText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emailSubmitDisabled: {
    opacity: 0.4,
  },
  toggleRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  toggleLink: {
    color: '#006FCF',
    fontWeight: '600' as const,
  },
  legalArea: {
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  legalText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#006FCF',
    fontWeight: '500' as const,
  },
  adDisclosure: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
