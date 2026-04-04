import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, CheckCircle, XCircle, X, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors, ThemeColors } from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { PlaceCategory, CATEGORY_LABELS } from '@/types';

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

const CATEGORIES: PlaceCategory[] = [
  'restaurant', 'cafe', 'bar', 'shop', 'hotel',
  'gas_station', 'grocery', 'entertainment', 'health', 'transport', 'other',
];

export default function AddReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addPlace } = usePlaces();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [category, setCategory] = useState<PlaceCategory>('restaurant');
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    console.log('[AddReport] Closing report screen');
    router.back();
  }, [router]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'fr' }, signal: controller.signal }
      );
      clearTimeout(timeoutId);
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      console.log('[AddReport] Fetched', data.length, 'suggestions for:', query);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[AddReport] Suggestion fetch timed out');
      } else {
        console.log('[AddReport] Suggestion fetch error:', err);
      }
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(text);
    }, 400);
  }, [fetchSuggestions]);

  const handleSelectSuggestion = useCallback((item: NominatimResult) => {
    const placeName = item.name || item.display_name.split(',')[0];
    setName(placeName);

    const addr = item.address;
    let formattedAddress = '';
    if (addr) {
      const parts: string[] = [];
      if (addr.house_number && addr.road) parts.push(`${addr.house_number} ${addr.road}`);
      else if (addr.road) parts.push(addr.road);
      const locality = addr.city || addr.town || addr.village;
      if (locality) parts.push(locality);
      if (addr.postcode) parts.push(addr.postcode);
      if (addr.country) parts.push(addr.country);
      formattedAddress = parts.join(', ');
    }
    setAddress(formattedAddress || item.display_name);
    setLatitude(parseFloat(item.lat));
    setLongitude(parseFloat(item.lon));
    setSuggestions([]);
    setShowSuggestions(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[AddReport] Selected suggestion:', placeName, formattedAddress);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const doSubmit = useCallback(() => {
    const newPlace = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: name.trim(),
      address: address.trim(),
      category,
      latitude: latitude ?? 48.8566 + (Math.random() - 0.5) * 0.04,
      longitude: longitude ?? 2.3522 + (Math.random() - 0.5) * 0.04,
      accepted: accepted!,
      reportsAccepted: accepted ? 1 : 0,
      reportsRefused: accepted ? 0 : 1,
      lastReportDate: new Date().toISOString().split('T')[0],
      reportedBy: 'Communauté',
    };

    addPlace(newPlace);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('[AddReport] Place added successfully:', newPlace.name, newPlace.id);
    router.back();
  }, [name, address, category, accepted, latitude, longitude, addPlace, router]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Information manquante', 'Veuillez entrer le nom du lieu.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Information manquante', "Veuillez entrer l'adresse.");
      return;
    }
    if (accepted === null) {
      Alert.alert('Information manquante', 'Veuillez indiquer si Amex a été acceptée ou refusée.');
      return;
    }

    Alert.alert(
      'Confirmer le signalement',
      `Voulez-vous signaler "${name.trim()}" comme ${accepted ? 'acceptant' : 'refusant'} Amex ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: doSubmit },
      ]
    );
  }, [name, address, accepted, doSubmit]);

  const handleAcceptedPress = useCallback((value: boolean) => {
    setAccepted(value);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[AddReport] Amex accepted set to:', value);
  }, []);

  const handleCategorySelect = useCallback((cat: PlaceCategory) => {
    setCategory(cat);
    setShowCategories(false);
    console.log('[AddReport] Category selected:', cat);
  }, []);

  const toggleCategories = useCallback(() => {
    setShowCategories((prev) => !prev);
  }, []);

  const isFormValid = name.trim().length > 0 && address.trim().length > 0 && accepted !== null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        testID="add-report-screen"
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton} testID="add-report-close">
            <X size={20} color={colors.textPrimary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Nouveau signalement</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <MapPin size={24} color="#006FCF" strokeWidth={1.5} />
            </View>
            <Text style={styles.heroTitle}>Signaler un lieu</Text>
            <Text style={styles.heroSubtitle}>Aidez la communauté en partageant votre expérience</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Nom du lieu</Text>
            <TextInput
              style={[styles.input, showSuggestions && styles.inputWithSuggestions]}
              placeholder="ex. Restaurant Le Marais"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={handleNameChange}
              testID="input-name"
            />
            {loadingSuggestions && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => {
                  const displayName = item.name || item.display_name.split(',')[0];
                  const subText = item.display_name.split(',').slice(1, 3).join(',').trim();
                  return (
                    <TouchableOpacity
                      key={item.place_id.toString()}
                      style={[
                        styles.suggestionItem,
                        index < suggestions.length - 1 && styles.suggestionItemBorder,
                      ]}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.6}
                      testID={`suggestion-${item.place_id}`}
                    >
                      <View style={styles.suggestionIcon}>
                        <MapPin size={14} color={colors.textSecondary} strokeWidth={1.5} />
                      </View>
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionName} numberOfLines={1}>{displayName}</Text>
                        {subText ? <Text style={styles.suggestionAddress} numberOfLines={1}>{subText}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              placeholder="ex. 12 Rue du Temple, Paris"
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
              testID="input-address"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Catégorie</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={toggleCategories}
              activeOpacity={0.7}
              testID="category-select"
            >
              <Text style={styles.selectText}>{CATEGORY_LABELS[category]}</Text>
              <ChevronDown size={18} color={colors.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
            {showCategories && (
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryOption, category === cat && styles.categoryOptionSelected]}
                    onPress={() => handleCategorySelect(cat)}
                    activeOpacity={0.7}
                    testID={`cat-option-${cat}`}
                  >
                    <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextSelected]}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Amex a-t-elle été acceptée ?</Text>
            <View style={styles.acceptRow}>
              <TouchableOpacity
                style={styles.acceptButtonWrap}
                onPress={() => handleAcceptedPress(true)}
                activeOpacity={0.7}
                testID="accept-yes"
              >
                <View
                  style={[
                    styles.acceptButton,
                    styles.acceptButtonYes,
                    accepted === true && styles.acceptButtonYesActive,
                  ]}
                >
                  <CheckCircle size={20} color={accepted === true ? '#FFF' : colors.accepted} strokeWidth={1.5} />
                  <Text style={[styles.acceptButtonText, accepted === true && styles.acceptButtonTextActive]}>
                    Oui, acceptée
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButtonWrap}
                onPress={() => handleAcceptedPress(false)}
                activeOpacity={0.7}
                testID="accept-no"
              >
                <View
                  style={[
                    styles.acceptButton,
                    styles.acceptButtonNo,
                    accepted === false && styles.acceptButtonNoActive,
                  ]}
                >
                  <XCircle size={20} color={accepted === false ? '#FFF' : colors.refused} strokeWidth={1.5} />
                  <Text style={[styles.acceptButtonText, accepted === false && styles.acceptButtonTextActive]}>
                    Non, refusée
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButtonWrap, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={!isFormValid}
            testID="submit-report"
          >
            <View style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Envoyer le signalement</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D6E6FF',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
  },
  formSection: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: colors.border,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '400' as const,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: '#006FCF',
    borderColor: '#006FCF',
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  acceptRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButtonWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  acceptButtonYes: {
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  acceptButtonYesActive: {
    backgroundColor: colors.accepted,
    borderColor: colors.accepted,
  },
  acceptButtonNo: {
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  acceptButtonNoActive: {
    backgroundColor: colors.refused,
    borderColor: colors.refused,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  acceptButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  submitButtonWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#006FCF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '400' as const,
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  suggestionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  suggestionAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '400' as const,
  },
});
