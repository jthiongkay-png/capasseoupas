import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Info, FileText, Shield, Mail, ChevronRight, CreditCard, Users, Star, Heart, LogIn, LogOut, User, Award } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { useAuth } from '@/providers/AuthProvider';

const APP_VERSION = '1.0.0';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: ThemeColors;
}

function SettingsRow({ icon, label, sublabel, onPress, rightElement, colors }: SettingsRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      {rightElement ?? (onPress ? <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.5} /> : null)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { places } = usePlaces();
  const { authUser, isAuthenticated, signOut } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const acceptedCount = places.filter((p) => p.accepted).length;
  const refusedCount = places.filter((p) => !p.accepted).length;

  const handleLogin = useCallback(() => {
    router.push('/login' as any);
  }, [router]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: () => signOut() },
      ]
    );
  }, [signOut]);

  const handleContact = useCallback(() => {
    Linking.openURL('mailto:contact@capasseoupas.app');
  }, []);

  const handleRate = useCallback(() => {
    if (Platform.OS === 'web') return;
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/capasseoupas'
      : 'https://play.google.com/store/apps/details?id=com.capasseoupas';
    Linking.openURL(storeUrl);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.appTitleRow}>
          <Text style={styles.appTitleC}>C</Text>
          <Text style={styles.appTitleRest}>apasseoupas</Text>
        </View>
        <Text style={styles.headerSubtitle}>Paramètres</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          {isAuthenticated && authUser ? (
            <>
              <SettingsRow
                colors={colors}
                icon={<User size={18} color="#006FCF" strokeWidth={1.5} />}
                label={authUser.username || 'Utilisateur'}
                sublabel={authUser.email}
              />
              <View style={styles.rowDivider} />
              <SettingsRow
                colors={colors}
                icon={<Award size={18} color={colors.warning} strokeWidth={1.5} />}
                label={authUser.level}
                sublabel={`${authUser.reportsCount} signalement${authUser.reportsCount !== 1 ? 's' : ''}`}
              />
              <View style={styles.rowDivider} />
              <SettingsRow
                colors={colors}
                icon={<LogOut size={18} color={colors.refused} strokeWidth={1.5} />}
                label="Se déconnecter"
                onPress={handleLogout}
              />
            </>
          ) : (
            <SettingsRow
              colors={colors}
              icon={<LogIn size={18} color="#006FCF" strokeWidth={1.5} />}
              label="Se connecter"
              sublabel="Connectez-vous pour signaler des commerces"
              onPress={handleLogin}
            />
          )}
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{places.length}</Text>
          <Text style={styles.statLabel}>Lieux</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accepted }]}>{acceptedCount}</Text>
          <Text style={styles.statLabel}>Acceptés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.refused }]}>{refusedCount}</Text>
          <Text style={styles.statLabel}>Refusés</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos de Capasseoupas</Text>
        <View style={styles.card}>
          <SettingsRow
            colors={colors}
            icon={<CreditCard size={18} color={colors.primary} strokeWidth={1.5} />}
            label="Qu'est-ce que Capasseoupas ?"
            sublabel="Carte communautaire des lieux acceptant Amex"
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            colors={colors}
            icon={<Users size={18} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Alimenté par la communauté"
            sublabel="Chaque signalement aide les porteurs Amex"
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            colors={colors}
            icon={<Info size={18} color={colors.textSecondary} strokeWidth={1.5} />}
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
            colors={colors}
            icon={<FileText size={18} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Conditions d'utilisation"
            sublabel="Règles d'utilisation de l'application"
            onPress={() => router.push('/terms' as never)}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            colors={colors}
            icon={<Shield size={18} color={colors.textSecondary} strokeWidth={1.5} />}
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
            colors={colors}
            icon={<Mail size={18} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Nous contacter"
            sublabel="contact@capasseoupas.app"
            onPress={handleContact}
          />
          {Platform.OS !== 'web' && (
            <>
              <View style={styles.rowDivider} />
              <SettingsRow
                colors={colors}
                icon={<Star size={18} color={colors.warning} strokeWidth={1.5} />}
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
          <Text style={styles.footerLogoAccent}>C</Text>
          <Text style={styles.footerLogoBold}>apasseoupas</Text>
        </View>
        <Text style={styles.footerText}>
          Fait avec <Heart size={10} color={colors.refused} /> pour la communauté Amex en France
        </Text>
        <Text style={styles.footerDisclaimer}>
          Capasseoupas n'est pas affilié à American Express.{'\n'}Toutes les données proviennent de la communauté.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appTitleC: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#006FCF',
  },
  appTitleRest: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowTextContainer: {
    flex: 1,
  },
  settingsRowLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  settingsRowSublabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
    fontWeight: '400' as const,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 64,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
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
    backgroundColor: colors.searchBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '400' as const,
  },
  stepDivider: {
    height: 1,
    backgroundColor: colors.border,
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
  footerLogoAccent: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#006FCF',
    letterSpacing: -0.5,
  },
  footerLogoBold: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDisclaimer: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
