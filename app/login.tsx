import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Animated, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Mail, X, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { AuthMethod } from '@/types';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
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

  const handleEmailLogin = useCallback(async () => {
    Keyboard.dismiss();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      await signIn(trimmed, 'email');
      console.log('[Login] Email login success:', trimmed);
      router.replace('/setup-username' as any);
    } catch (e) {
      console.log('[Login] Email login error:', e);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [email, signIn, router]);

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
                <View style={styles.emailInputRow}>
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
                  <TouchableOpacity
                    style={[styles.emailSubmit, (!email.trim() || isLoading) && styles.emailSubmitDisabled]}
                    onPress={handleEmailLogin}
                    activeOpacity={0.8}
                    disabled={!email.trim() || isLoading}
                  >
                    <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
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
  emailInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailSubmit: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#006FCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailSubmitDisabled: {
    opacity: 0.4,
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
