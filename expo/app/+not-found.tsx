import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useMemo } from 'react';

export default function NotFoundScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable' }} />
      <View style={styles.container} testID="not-found-screen">
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.title}>Cette page n'existe pas</Text>
        <Text style={styles.subtitle}>La page que vous cherchez est introuvable.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Retour à l'accueil</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    color: colors.textPrimary,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#006FCF',
  },
});
