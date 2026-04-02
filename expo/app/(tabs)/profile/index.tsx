import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Info, FileText, Shield, Mail, ChevronRight, CreditCard, Users, Star, Heart, Flag, AlertOctagon, User, LogOut, Bookmark, Edit3 } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useFavourites } from '@/providers/FavouritesProvider';

const APP_VERSION = '2.0.1';

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
  const { user, signOut } = useAuth();
  const { favouriteIds } = useFavourites();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const acceptedCount = places.filter((p) => p.accepted).length;
  const refusedCount = places.filter((p) => !p.accepted).length;

  const handleContact = useCallback(() => {
    void Linking.openURL('mailto:contact@capasseoupas.app');
  }, []);

  const handleReportAbuse = useCallback(() => {
    Alert.alert(
      'Signaler un abus',
      'Comment souhaitez-vous signaler ?',
      [
        {
          text: 'Par e-mail',
          onPress: () => void Linking.openURL('mailto:contact@capasseoupas.app?subject=Signalement%20d%27abus%20-%20Capasseoupas'),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  }, []);

  const handleRate = useCallback(() => {
    if (Platform.OS === 'web') return;
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/capasseoupas'
      : 'https://play.google.com/store/apps/details?id=com.capasseoupas';
    void Linking.openURL(storeUrl);
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            void signOut();
            console.log('[Settings] User signed out');
          },
        },
      ]
    );
  }, [signOut]);

  const authMethodLabel = useMemo(() => {
    if (!user) return '';
    switch (user.authMethod) {
      case 'apple': return 'Apple';
      case 'google': return 'Google';
      case 'email': return 'E-mail';
      default: return '';
    }
  }, [user]);

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
        <Text style={styles.sectionTitle}>Mon profil</Text>
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <User size={24} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.username ?? 'Utilisateur'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
              <View style={styles.profileBadgeRow}>
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>Connecté via {authMethodLabel}</Text>
                </View>
                <View style={[styles.profileBadge, styles.profileLevelBadge]}>
                  <Text style={styles.profileLevelText}>{user?.level ?? 'Débutant'}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.rowDivider} />
          <SettingsRow
            colors={colors}
            icon={<Bookmark size={18} color="#006FCF" strokeWidth={1.5} />}
            label="Mes favoris"
            sublabel={`${favouriteIds.length} lieu${favouriteIds.length > 1 ? 'x' : ''} sauvegardé${favouriteIds.length > 1 ? 's' : ''}`}
            onPress={() => router.push('/(tabs)/profile/favourites' as never)}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            colors={colors}
            icon={<Edit3 size={18} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Mes signalements"
            sublabel={`${user?.reportsCount ?? 0} signalement${(user?.reportsCount ?? 0) > 1 ? 's' : ''}`}
            onPress={() => router.push('/(tabs)/profile/my-reports' as never)}
          />
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
        <Text style={styles.sectionTitle}>Modération et signalement</Text>
        <View style={styles.card}>
          <SettingsRow
            colors={colors}
            icon={<Flag size={18} color={colors.warning} strokeWidth={1.5} />}
            label="Signaler un abus"
            sublabel="Contenu inapproprié, informations incorrectes"
            onPress={handleReportAbuse}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            colors={colors}
            icon={<AlertOctagon size={18} color={colors.textSecondary} strokeWidth={1.5} />}
            label="Politique de modération"
            sublabel="Comment nous gérons les contenus signalés"
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

      <View style={styles.section}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.logoutRow} onPress={handleSignOut} activeOpacity={0.6}>
            <View style={[styles.settingsRowIcon, styles.logoutIcon]}>
              <LogOut size={18} color="#FF453A" strokeWidth={1.5} />
            </View>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  profileBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.searchBg,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  profileLevelBadge: {
    backgroundColor: '#EBF3FF',
  },
  profileLevelText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#006FCF',
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
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoutIcon: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FF453A',
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
