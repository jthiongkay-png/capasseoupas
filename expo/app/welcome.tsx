import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, ArrowRight } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.topSection, { paddingTop: insets.top + 60 }]}>
          <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoCircle}>
              <CreditCard size={32} color="#006FCF" strokeWidth={1.5} />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.titleAccent}>C</Text>
              <Text style={styles.titleRest}>apasseoupas</Text>
            </View>
            <Text style={styles.tagline}>
              Découvrez les lieux qui acceptent{'\n'}votre carte American Express
            </Text>
          </Animated.View>

          <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Carte interactive des commerces</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Signalements de la communauté</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Sauvegardez vos lieux favoris</Text>
            </View>
          </Animated.View>
        </View>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/signup' as never)}
            activeOpacity={0.8}
            testID="welcome-signup"
          >
            <Text style={styles.signupButtonText}>Créer un compte</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login' as never)}
            activeOpacity={0.7}
            testID="welcome-login"
          >
            <Text style={styles.loginButtonText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleAccent: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: '#006FCF',
  },
  titleRest: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: colors.textPrimary,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 16,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006FCF',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  bottomSection: {
    paddingHorizontal: 28,
    gap: 12,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#006FCF',
    borderRadius: 14,
    paddingVertical: 16,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
});
