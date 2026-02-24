import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SetupUsernameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setUsername, authUser } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      Alert.alert('Nom trop court', 'Votre nom d\'utilisateur doit contenir au moins 3 caractères.');
      return;
    }
    if (trimmed.length > 20) {
      Alert.alert('Nom trop long', 'Votre nom d\'utilisateur ne doit pas dépasser 20 caractères.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUsername(trimmed);
    console.log('[SetupUsername] Username set:', trimmed);
    router.replace('/(tabs)/(map)' as any);
  }, [name, setUsername, router]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const isValid = name.trim().length >= 3 && name.trim().length <= 20;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <User size={28} color="#006FCF" strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Choisissez votre pseudo</Text>
            <Text style={styles.subtitle}>
              Ce nom sera visible lorsque vous signalez un commerce
            </Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="ex. AmexFan75"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                testID="input-username"
              />
              {isValid && (
                <View style={styles.checkIcon}>
                  <Check size={18} color={colors.accepted} strokeWidth={2} />
                </View>
              )}
            </View>
            <Text style={styles.charCount}>{name.trim().length}/20 caractères</Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            disabled={!isValid}
          >
            <Animated.View
              style={[
                styles.submitButton,
                !isValid && styles.submitDisabled,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.submitText}>Commencer</Text>
            </Animated.View>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: 40,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500' as const,
  },
  checkIcon: {
    marginLeft: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    marginTop: 8,
    paddingLeft: 4,
  },
  submitButton: {
    backgroundColor: '#006FCF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.35,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
