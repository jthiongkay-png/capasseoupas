import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { Place } from '@/types';
import PlaceCard from '@/components/PlaceCard';

export default function MyReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { places, deletePlace } = usePlaces();

  const userPlaces = useMemo(() => {
    return places.filter((p) => p.reportedBy === 'Communauté');
  }, [places]);

  const handlePlacePress = useCallback((place: Place) => {
    router.push(`/place/${place.id}` as any);
  }, [router]);

  const handleDelete = useCallback((place: Place) => {
    Alert.alert(
      'Supprimer ce lieu',
      `Êtes-vous sûr de vouloir supprimer "${place.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deletePlace(place.id);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            console.log('[MyReports] Deleted place:', place.name);
          },
        },
      ]
    );
  }, [deletePlace]);

  const renderPlace = useCallback(({ item }: { item: Place }) => (
    <View style={styles.reportItem}>
      <PlaceCard place={item} onPress={handlePlacePress} />
      <TouchableOpacity
        style={styles.deleteRow}
        onPress={() => handleDelete(item)}
        activeOpacity={0.7}
      >
        <Trash2 size={14} color="#FF453A" strokeWidth={1.5} />
        <Text style={styles.deleteText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  ), [handlePlacePress, handleDelete, styles]);

  const keyExtractor = useCallback((item: Place) => item.id, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Mes signalements</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={userPlaces}
          renderItem={renderPlace}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <FileText size={32} color={colors.textTertiary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Aucun signalement</Text>
              <Text style={styles.emptyText}>
                Vos signalements apparaîtront ici. Ajoutez un lieu depuis la carte pour commencer.
              </Text>
            </View>
          }
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  reportItem: {
    marginBottom: 4,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: -2,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
    backgroundColor: colors.surface,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#FF453A',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400' as const,
    lineHeight: 20,
  },
});
