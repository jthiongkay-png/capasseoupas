import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import {
  ChevronRight,
  FileText,
  Shield,
  Mail,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const APP_VERSION = '1.2.0';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
  colors: ThemeColors;
  showChevron?: boolean;
  testID?: string;
}

const SettingsItem = React.memo(function SettingsItem({
  icon,
  label,
  sublabel,
  onPress,
  colors,
  showChevron = true,
  testID,
}: SettingsItemProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={handlePress}
      activeOpacity={0.6}
      testID={testID}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemLabel}>{label}</Text>
          {sublabel ? (
            <Text style={styles.settingsItemSublabel}>{sublabel}</Text>
          ) : null}
        </View>
      </View>
      {showChevron ? (
        <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.5} />
      ) : null}
    </TouchableOpacity>
  );
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  console.log('[Settings] Screen loaded');

  const handleOpenTerms = useCallback(() => {
    router.push('/terms');
  }, [router]);

  const handleOpenPrivacy = useCallback(() => {
    router.push('/privacy');
  }, [router]);

  const handleContactUs = useCallback(() => {
    void Linking.openURL('mailto:contact@capasseoupas.app');
  }, []);

  const handleOpenWebsite = useCallback(() => {
    void Linking.openURL('https://capasseoupas.app');
  }, []);

  return (
    <View style={styles.container} testID="settings-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Réglages</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Informations légales</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            icon={<FileText size={20} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Conditions d'utilisation"
            onPress={handleOpenTerms}
            colors={colors}
            testID="settings-terms"
          />
          <View style={styles.separator} />
          <SettingsItem
            icon={<Shield size={20} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Politique de confidentialité"
            onPress={handleOpenPrivacy}
            colors={colors}
            testID="settings-privacy"
          />
        </View>

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            icon={<Mail size={20} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Nous contacter"
            sublabel="contact@capasseoupas.app"
            onPress={handleContactUs}
            colors={colors}
            testID="settings-contact"
          />
          <View style={styles.separator} />
          <SettingsItem
            icon={<ExternalLink size={20} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Site web"
            sublabel="capasseoupas.app"
            onPress={handleOpenWebsite}
            colors={colors}
            testID="settings-website"
          />
        </View>

        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.sectionCard}>
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={styles.iconContainer}>
                <Info size={20} color={colors.textSecondary} strokeWidth={1.5} />
              </View>
              <View style={styles.settingsItemText}>
                <Text style={styles.settingsItemLabel}>Version</Text>
                <Text style={styles.settingsItemSublabel}>{APP_VERSION}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Capasseoupas n'est pas affiliée à American Express.{'\n'}
          Les données sont fournies par la communauté.
        </Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: colors.textTertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginTop: 24,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.searchBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    settingsItemText: {
      flex: 1,
    },
    settingsItemLabel: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: colors.textPrimary,
    },
    settingsItemSublabel: {
      fontSize: 13,
      fontWeight: '400' as const,
      color: colors.textTertiary,
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 66,
    },
    footer: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: 18,
      marginTop: 32,
    },
  });
