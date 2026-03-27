import React, { useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Image, Dimensions, Platform, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, XCircle, MapPin, ThumbsUp, ThumbsDown, Trash2, Phone, Globe, Navigation, Share2, AlertTriangle, Info, Flag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { useUser } from '@/providers/UserProvider';
import { CATEGORY_LABELS, PlaceCategory } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 220;

const CATEGORY_PHOTOS: Record<PlaceCategory, string> = {
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  gas_station: 'https://images.unsplash.com/photo-1545262810-77515befe149?w=800&q=80',
  grocery: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
  entertainment: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&q=80',
  health: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  transport: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
};

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getPlaceById, updatePlaceReport, deletePlace } = usePlaces();
  const { incrementReports } = useUser();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const place = useMemo(() => getPlaceById(id ?? ''), [getPlaceById, id]);

  const totalReports = place ? place.reportsAccepted + place.reportsRefused : 0;
  const acceptRate = totalReports > 0 && place ? Math.round((place.reportsAccepted / totalReports) * 100) : 0;
  const isNotAccepted = totalReports > 0 && acceptRate < 90;

  const handleDirections = useCallback(() => {
    if (!place) return;
    const lat = place.latitude;
    const lng = place.longitude;
    const label = encodeURIComponent(place.name);

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Ouvrir dans',
        'Choisissez votre application de navigation',
        [
          {
            text: 'Apple Plans',
            onPress: () => void Linking.openURL(`maps:?daddr=${lat},${lng}&q=${label}`),
          },
          {
            text: 'Google Maps',
            onPress: () => {
              const gmapsUrl = `comgooglemaps://?daddr=${lat},${lng}&q=${label}`;
              void Linking.canOpenURL(gmapsUrl).then((supported) => {
                if (supported) {
                  void Linking.openURL(gmapsUrl);
                } else {
                  void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                }
              });
            },
          },
          {
            text: 'Waze',
            onPress: () => {
              const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`;
              void Linking.canOpenURL(wazeUrl).then((supported) => {
                if (supported) {
                  void Linking.openURL(wazeUrl);
                } else {
                  void Linking.openURL(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`);
                }
              });
            },
          },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    } else if (Platform.OS === 'android') {
      void Linking.openURL(`google.navigation:q=${lat},${lng}`).catch(() => {
        void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      });
    } else {
      void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
    console.log('[PlaceDetail] Opening directions for', place.name);
  }, [place]);

  const handleCall = useCallback(() => {
    if (!place) return;
    if (!place.phone) {
      Alert.alert('Numéro indisponible', "Aucun numéro de téléphone n'est enregistré pour cet établissement.");
      return;
    }
    Alert.alert(
      place.name,
      place.phone,
      [
        {
          text: 'Appeler',
          onPress: () => {
            const phoneUrl = `tel:${place.phone!.replace(/\s/g, '')}`;
            void Linking.openURL(phoneUrl).catch(() => {
              console.log('[PlaceDetail] Cannot open phone dialer');
            });
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
    console.log('[PlaceDetail] Call action for', place.name, place.phone);
  }, [place]);

  const handleWebsite = useCallback(() => {
    if (!place) return;
    if (!place.website) {
      Alert.alert('Site web indisponible', "Aucun site web n'est enregistré pour cet établissement.");
      return;
    }
    void Linking.openURL(place.website).catch(() => {
      console.log('[PlaceDetail] Cannot open website:', place.website);
    });
    console.log('[PlaceDetail] Opening website for', place.name);
  }, [place]);

  const handleShare = useCallback(async () => {
    if (!place) return;
    try {
      await Share.share({
        message: `${place.name} - ${place.address}\nStatut Amex : ${place.accepted ? 'Acceptée' : 'Refusée'}\nTaux d'acceptation : ${Math.round((place.reportsAccepted / Math.max(place.reportsAccepted + place.reportsRefused, 1)) * 100)}%`,
      });
      console.log('[PlaceDetail] Shared', place.name);
    } catch (error) {
      console.log('[PlaceDetail] Share error:', error);
    }
  }, [place]);

  const handleReport = useCallback((accepted: boolean) => {
    if (!place) return;
    updatePlaceReport(place.id, accepted);
    incrementReports();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('[PlaceDetail] Reported', place.name, 'as', accepted ? 'accepted' : 'refused');
  }, [place, updatePlaceReport, incrementReports]);

  const handleDelete = useCallback(() => {
    if (!place) return;
    Alert.alert(
      'Supprimer ce lieu',
      `Êtes-vous sûr de vouloir supprimer "${place.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deletePlace(place.id);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            console.log('[PlaceDetail] Deleted place:', place.name);
            router.back();
          },
        },
      ]
    );
  }, [place, deletePlace, router]);

  const handleFlagContent = useCallback(() => {
    if (!place) return;
    Alert.alert(
      'Signaler un contenu',
      'Pourquoi souhaitez-vous signaler ce lieu ?',
      [
        {
          text: 'Informations incorrectes',
          onPress: () => {
            Alert.alert(
              'Signalement envoyé',
              'Merci pour votre signalement. Notre équipe examinera ce contenu dans les plus brefs délais. Vous pouvez aussi nous contacter à contact@capasseoupas.app',
            );
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            console.log('[PlaceDetail] Flagged place as incorrect:', place.name);
          },
        },
        {
          text: 'Contenu inapproprié',
          onPress: () => {
            Alert.alert(
              'Signalement envoyé',
              'Merci pour votre signalement. Notre équipe examinera ce contenu dans les plus brefs délais. Vous pouvez aussi nous contacter à contact@capasseoupas.app',
            );
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            console.log('[PlaceDetail] Flagged place as inappropriate:', place.name);
          },
        },
        {
          text: 'Lieu en double',
          onPress: () => {
            Alert.alert(
              'Signalement envoyé',
              'Merci pour votre signalement. Notre équipe examinera ce contenu dans les plus brefs délais.',
            );
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            console.log('[PlaceDetail] Flagged place as duplicate:', place.name);
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }, [place]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!place) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Lieu introuvable</Text>
          </View>
        </View>
      </>
    );
  }

  const photoUrl = CATEGORY_PHOTOS[place.category];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <Text style={styles.stickyHeaderTitle} numberOfLines={1}>{place.name}</Text>
      </Animated.View>

      <View style={[styles.floatingNav, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
          <ArrowLeft size={20} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.navButton}>
          <Trash2 size={18} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: photoUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={[styles.heroContent, { paddingTop: insets.top + 50 }]}>
            <View style={styles.heroStatusRow}>
              {isNotAccepted ? (
                <View style={[styles.statusChip, styles.statusChipNotAccepted]}>
                  <AlertTriangle size={14} color="#FF9500" strokeWidth={2} />
                  <Text style={styles.statusChipTextWarning}>Non accepté</Text>
                </View>
              ) : place.accepted ? (
                <View style={[styles.statusChip, styles.statusChipAccepted]}>
                  <CheckCircle size={14} color="#34C759" strokeWidth={2} />
                  <Text style={styles.statusChipTextAccepted}>Amex acceptée</Text>
                </View>
              ) : (
                <View style={[styles.statusChip, styles.statusChipRefused]}>
                  <XCircle size={14} color="#FF453A" strokeWidth={2} />
                  <Text style={styles.statusChipTextRefused}>Amex refusée</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroName}>{place.name}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroCategoryText}>{CATEGORY_LABELS[place.category]}</Text>
              <View style={styles.heroDot} />
              <Text style={styles.heroRateText}>{acceptRate}% d'acceptation</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={handleDirections}>
            <View style={styles.actionIcon}>
              <Navigation size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionLabel}>Itinéraire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={handleCall}>
            <View style={[styles.actionIcon, !place.phone && styles.actionIconDisabled]}>
              <Phone size={18} color={place.phone ? colors.primary : colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.actionLabel, !place.phone && styles.actionLabelDisabled]}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={handleWebsite}>
            <View style={[styles.actionIcon, !place.website && styles.actionIconDisabled]}>
              <Globe size={18} color={place.website ? colors.primary : colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.actionLabel, !place.website && styles.actionLabelDisabled]}>Site web</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={handleShare}>
            <View style={styles.actionIcon}>
              <Share2 size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionLabel}>Partager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.addressSection}>
            <MapPin size={18} color={colors.textSecondary} strokeWidth={1.5} />
            <View style={styles.addressContent}>
              <Text style={styles.addressText}>{place.address}</Text>
              <Text style={styles.addressSub}>
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {isNotAccepted && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={18} color="#FF9500" strokeWidth={1.5} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Statut : Non accepté</Text>
              <Text style={styles.warningSubtext}>
                Le taux d'acceptation ({acceptRate}%) est inférieur à 90%. Ce lieu est considéré comme ne prenant pas Amex.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{acceptRate}%</Text>
              <Text style={styles.statLabel}>Taux d'accept.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReports}</Text>
              <Text style={styles.statLabel}>Signalements</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{place.lastReportDate.slice(5)}</Text>
              <Text style={styles.statLabel}>Dernier</Text>
            </View>
          </View>

          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>Répartition</Text>
            </View>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.breakdownFillAccepted,
                  { flex: place.reportsAccepted || 0.01 },
                ]}
              />
              <View
                style={[
                  styles.breakdownFillRefused,
                  { flex: place.reportsRefused || 0.01 },
                ]}
              />
            </View>
            <View style={styles.breakdownLabels}>
              <View style={styles.breakdownLabelRow}>
                <View style={[styles.breakdownDot, { backgroundColor: colors.accepted }]} />
                <Text style={styles.breakdownLabelText}>Accepté : {place.reportsAccepted}</Text>
              </View>
              <View style={styles.breakdownLabelRow}>
                <View style={[styles.breakdownDot, { backgroundColor: colors.refused }]} />
                <Text style={styles.breakdownLabelText}>Refusé : {place.reportsRefused}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Catégorie</Text>
            <Text style={styles.infoValue}>{CATEGORY_LABELS[place.category]}</Text>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dernier signalement</Text>
            <Text style={styles.infoValue}>{place.lastReportDate}</Text>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut Amex</Text>
            <Text style={[
              styles.infoValue,
              { color: isNotAccepted ? '#FF9500' : place.accepted ? colors.accepted : colors.refused }
            ]}>
              {isNotAccepted ? 'Non accepté' : place.accepted ? 'Acceptée' : 'Refusée'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Votre expérience</Text>
          <Text style={styles.contributeSubtitle}>Votre carte Amex a-t-elle été acceptée ici ?</Text>
          <View style={styles.contributeRow}>
            <TouchableOpacity
              style={styles.contributeButtonWrap}
              onPress={() => handleReport(true)}
              activeOpacity={0.8}
            >
              <View style={styles.contributeButtonAccepted}>
                <ThumbsUp size={18} color="#FFF" strokeWidth={1.5} />
                <Text style={styles.contributeButtonText}>Acceptée</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contributeButtonWrap}
              onPress={() => handleReport(false)}
              activeOpacity={0.8}
            >
              <View style={styles.contributeButtonRefused}>
                <ThumbsDown size={18} color="#FFF" strokeWidth={1.5} />
                <Text style={styles.contributeButtonText}>Refusée</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.flagButton}
          onPress={handleFlagContent}
          activeOpacity={0.7}
          testID="flag-content"
        >
          <Flag size={16} color={colors.textSecondary} strokeWidth={1.5} />
          <Text style={styles.flagButtonText}>Signaler un problème</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color="#FF453A" strokeWidth={1.5} />
          <Text style={styles.deleteButtonText}>Supprimer ce lieu</Text>
        </TouchableOpacity>

        <View style={styles.disclaimerContainer}>
          <Info size={14} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.disclaimerText}>
            Ça Passe ou Pas ne peut être tenu responsable des informations enregistrées par les utilisateurs sur l'application. Les données sont fournies à titre indicatif et peuvent ne pas refléter la situation actuelle de l'établissement.
          </Text>
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </Animated.ScrollView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: colors.background,
    paddingBottom: 12,
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  floatingNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageContainer: {
    height: HERO_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroStatusRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusChipAccepted: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  statusChipRefused: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  statusChipNotAccepted: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  statusChipTextAccepted: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#34C759',
  },
  statusChipTextRefused: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FF453A',
  },
  statusChipTextWarning: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FF9500',
  },
  heroName: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroCategoryText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.85)',
  },
  heroDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroRateText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.85)',
  },
  actionBar: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  actionIconDisabled: {
    opacity: 0.5,
  },
  actionLabelDisabled: {
    color: colors.textTertiary,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  addressSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  addressSub: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.warningLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.warning,
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  breakdownContainer: {},
  breakdownHeader: {
    marginBottom: 10,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: colors.searchBg,
  },
  breakdownFillAccepted: {
    backgroundColor: colors.accepted,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  breakdownFillRefused: {
    backgroundColor: colors.refused,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  breakdownLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabelText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  contributeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: -6,
    fontWeight: '400' as const,
  },
  contributeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contributeButtonWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contributeButtonAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accepted,
    borderRadius: 12,
    paddingVertical: 14,
  },
  contributeButtonRefused: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.refused,
    borderRadius: 12,
    paddingVertical: 14,
  },
  contributeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  flagButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    backgroundColor: colors.background,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FF453A',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.searchBg,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    lineHeight: 16,
  },
});
