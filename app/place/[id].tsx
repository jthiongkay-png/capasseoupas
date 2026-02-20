import React, { useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, XCircle, MapPin, Clock, Users, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { useUser } from '@/providers/UserProvider';
import { CATEGORY_LABELS } from '@/types';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getPlaceById, updatePlaceReport } = usePlaces();
  const { incrementReports } = useUser();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scaleAccepted = useRef(new Animated.Value(1)).current;
  const scaleRefused = useRef(new Animated.Value(1)).current;

  const place = useMemo(() => getPlaceById(id ?? ''), [getPlaceById, id]);

  const totalReports = place ? place.reportsAccepted + place.reportsRefused : 0;
  const acceptRate = totalReports > 0 && place ? Math.round((place.reportsAccepted / totalReports) * 100) : 0;

  const handleReport = useCallback((accepted: boolean) => {
    if (!place) return;
    updatePlaceReport(place.id, accepted);
    incrementReports();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('[PlaceDetail] Reported', place.name, 'as', accepted ? 'accepted' : 'refused');
  }, [place, updatePlaceReport, incrementReports]);

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroSection, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusBanner}>
            <View style={[styles.statusPill, { backgroundColor: place.accepted ? colors.acceptedLight : colors.refusedLight }]}>
              {place.accepted ? (
                <CheckCircle size={16} color={colors.accepted} strokeWidth={1.5} />
              ) : (
                <XCircle size={16} color={colors.refused} strokeWidth={1.5} />
              )}
              <Text style={[styles.statusPillText, { color: place.accepted ? colors.accepted : colors.refused }]}>
                {place.accepted ? 'Amex acceptée' : 'Amex refusée'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroName}>{place.name}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{CATEGORY_LABELS[place.category]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.addressText}>{place.address}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <TrendingUp size={18} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.statBoxValue}>{acceptRate}%</Text>
              <Text style={styles.statBoxLabel}>Taux d'accept.</Text>
            </View>
            <View style={styles.statBoxDivider} />
            <View style={styles.statBox}>
              <Users size={18} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.statBoxValue}>{totalReports}</Text>
              <Text style={styles.statBoxLabel}>Signalements</Text>
            </View>
            <View style={styles.statBoxDivider} />
            <View style={styles.statBox}>
              <Clock size={18} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.statBoxValue}>{place.lastReportDate.slice(5)}</Text>
              <Text style={styles.statBoxLabel}>Dernier</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Répartition des signalements</Text>
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

          <View style={styles.divider} />

          <View style={styles.reportedByRow}>
            <Text style={styles.reportedByLabel}>Dernier signalement par</Text>
            <Text style={styles.reportedByName}>{place.reportedBy}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.contributeSection}>
            <Text style={styles.contributeTitle}>Confirmez ou mettez à jour</Text>
            <Text style={styles.contributeSubtitle}>Votre carte Amex a-t-elle été acceptée ici ?</Text>
            <View style={styles.contributeRow}>
              <TouchableOpacity
                style={styles.contributeButtonWrap}
                onPress={() => handleReport(true)}
                activeOpacity={0.8}
              >
                <View style={styles.contributeButtonAccepted}>
                  <ThumbsUp size={18} color="#FFF" strokeWidth={1.5} />
                  <Text style={styles.contributeButtonText}>Oui, acceptée</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contributeButtonWrap}
                onPress={() => handleReport(false)}
                activeOpacity={0.8}
              >
                <View style={styles.contributeButtonRefused}>
                  <ThumbsDown size={18} color="#FFF" strokeWidth={1.5} />
                  <Text style={styles.contributeButtonText}>Non, refusée</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
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
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroNav: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
  },
  categoryTag: {
    backgroundColor: colors.searchBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  content: {
    paddingTop: 0,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '400' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statBoxDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  statBoxValue: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  statBoxLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  breakdownSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
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
  reportedByRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportedByLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400' as const,
  },
  reportedByName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  contributeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  contributeTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  contributeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 18,
    fontWeight: '400' as const,
  },
  contributeRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
});
