import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Info, FileText, Shield, Mail, ChevronRight, CreditCard, Users, Star, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';

const APP_VERSION = '1.0.0';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingsRow({ icon, label, sublabel, onPress, rightElement }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingsRowLeft}>
        <View style={styles.settingsRowIcon}>{icon}</View>
        <View style={styles.settingsRowTextContainer}>
          <Text style={styles.settingsRowLabel}>{label}</Text>
          {sublabel && <Text style={styles.settingsRowSublabel}>{sublabel}</Text>}
        </View>
      </View>
      {rightElement ?? (onPress ? <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={1.5} /> : null)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { places } = usePlaces();

  const acceptedCount = places.filter((p) => p.accepted).length;
  const refusedCount = places.filter((p) => !p.accepted).length;

  const handleContact = useCallback(() => {
    Linking.openURL('mailto:contact@jamex.app');
  }, []);

  const handleRate = useCallback(() => {
    if (Platform.OS === 'web') return;
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/jamex'
      : 'https://play.google.com/store/apps/details?id=com.jamex';
    Linking.openURL(storeUrl);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{places.length}</Text>
          <Text style={styles.statLabel}>Lieux</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.accepted }]}>{acceptedCount}</Text>
          <Text style={styles.statLabel}>Acceptés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.refused }]}>{refusedCount}</Text>
          <Text style={styles.statLabel}>Refusés</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos de Jamex</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<CreditCard size={18} color={Colors.primary} strokeWidth={1.5} />}
            label="Qu'est-ce que Jamex ?"
            sublabel="Carte communautaire des lieux acceptant Amex"
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={<Users size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
            label="Alimenté par la communauté"
            sublabel="Chaque signalement aide les porteurs Amex"
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={<Info size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
            label="Version"
            rightElement={<Text style={styles.versionText}>{APP_VERSION}</Text>}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.card}>
          <View style={styles.howItWorksStep}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Trouvez un lieu</Text>
              <Text style={styles.stepDesc}>Explorez la carte ou recherchez un commerce</Text>
            </View>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.howItWorksStep}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Signalez votre expérience</Text>
              <Text style={styles.stepDesc}>Indiquez si votre carte Amex a été acceptée ou non</Text>
            </View>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.howItWorksStep}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Aidez les autres</Text>
              <Text style={styles.stepDesc}>Votre contribution aide la communauté Amex en France</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations légales</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<FileText size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
            label="Conditions d'utilisation"
            sublabel="Règles d'utilisation de l'application"
            onPress={() => router.push('/terms' as never)}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={<Shield size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
            label="Politique de confidentialité"
            sublabel="Comment nous protégeons vos données"
            onPress={() => router.push('/privacy' as never)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Mail size={18} color={Colors.textSecondary} strokeWidth={1.5} />}
            label="Nous contacter"
            sublabel="contact@jamex.app"
            onPress={handleContact}
          />
          {Platform.OS !== 'web' && (
            <>
              <View style={styles.rowDivider} />
              <SettingsRow
                icon={<Star size={18} color={Colors.warning} strokeWidth={1.5} />}
                label="Noter l'application"
                sublabel="Votre avis compte !"
                onPress={handleRate}
              />
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <Text style={styles.footerLogoLight}>Ja</Text>
          <Text style={styles.footerLogoBold}>mex</Text>
        </View>
        <Text style={styles.footerText}>
          Fait avec <Heart size={10} color={Colors.refused} /> pour la communauté Amex en France
        </Text>
        <Text style={styles.footerDisclaimer}>
          Jamex n'est pas affilié à American Express.{'\n'}Toutes les données proviennent de la communauté.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingsRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowTextContainer: {
    flex: 1,
  },
  settingsRowLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  settingsRowSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
    fontWeight: '400' as const,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 64,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '400' as const,
  },
  stepDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 64,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 36,
    gap: 6,
  },
  footerLogo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  footerLogoLight: {
    fontSize: 18,
    fontWeight: '300' as const,
    color: Colors.textSecondary,
    letterSpacing: -0.5,
  },
  footerLogoBold: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDisclaimer: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
