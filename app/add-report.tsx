import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, CheckCircle, XCircle, X, ChevronDown } from 'lucide-react-native';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { usePlaces } from '@/providers/PlacesProvider';
import { useUser } from '@/providers/UserProvider';
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
  const { user, incrementReports } = useUser();

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

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      console.log('[AddReport] Fetched suggestions:', data.length);
    } catch (err) {
      console.log('[AddReport] Suggestion fetch error:', err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[AddReport] Selected:', placeName, formattedAddress);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Information manquante', 'Veuillez entrer le nom du lieu.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Information manquante', 'Veuillez entrer l\'adresse.');
      return;
    }
    if (accepted === null) {
      Alert.alert('Information manquante', 'Veuillez indiquer si Amex a été acceptée ou refusée.');
      return;
    }

    const newPlace = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: name.trim(),
      address: address.trim(),
      category,
      latitude: latitude ?? 48.8566 + (Math.random() - 0.5) * 0.04,
      longitude: longitude ?? 2.3522 + (Math.random() - 0.5) * 0.04,
      accepted,
      reportsAccepted: accepted ? 1 : 0,
      reportsRefused: accepted ? 0 : 1,
      lastReportDate: new Date().toISOString().split('T')[0],
      reportedBy: user.username,
    };

    addPlace(newPlace);
    incrementReports();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('[AddReport] Place added:', newPlace.name);
    router.back();
  }, [name, address, category, accepted, latitude, longitude, addPlace, incrementReports, user.username, router]);

  const handleAcceptedPress = useCallback((value: boolean) => {
    setAccepted(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={20} color={Colors.textPrimary} strokeWidth={1.5} />
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
              <MapPin size={24} color={Colors.textPrimary} strokeWidth={1.5} />
            </View>
            <Text style={styles.heroTitle}>Signaler un lieu</Text>
            <Text style={styles.heroSubtitle}>Aidez la communauté en partageant votre expérience</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Nom du lieu</Text>
            <TextInput
              style={[styles.input, showSuggestions && styles.inputWithSuggestions]}
              placeholder="ex. Restaurant Le Marais"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={handleNameChange}
              testID="input-name"
            />
            {loadingSuggestions && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.textSecondary} />
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
                    >
                      <View style={styles.suggestionIcon}>
                        <MapPin size={14} color={Colors.textSecondary} strokeWidth={1.5} />
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
              placeholderTextColor={Colors.textTertiary}
              value={address}
              onChangeText={setAddress}
              testID="input-address"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Catégorie</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowCategories(!showCategories)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectText}>{CATEGORY_LABELS[category]}</Text>
              <ChevronDown size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
            {showCategories && (
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryOption, category === cat && styles.categoryOptionSelected]}
                    onPress={() => { setCategory(cat); setShowCategories(false); }}
                    activeOpacity={0.7}
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
              >
                <GlassView
                  style={[
                    styles.acceptButton,
                    styles.acceptButtonYes,
                    accepted === true && styles.acceptButtonYesActive,
                  ]}
                  glassEffectStyle={accepted === true ? 'regular' : 'clear'}
                  tintColor={accepted === true ? Colors.accepted : undefined}
                >
                  <CheckCircle size={20} color={accepted === true ? '#FFF' : Colors.accepted} strokeWidth={1.5} />
                  <Text style={[styles.acceptButtonText, accepted === true && styles.acceptButtonTextActive]}>
                    Oui, acceptée
                  </Text>
                </GlassView>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButtonWrap}
                onPress={() => handleAcceptedPress(false)}
                activeOpacity={0.7}
              >
                <GlassView
                  style={[
                    styles.acceptButton,
                    styles.acceptButtonNo,
                    accepted === false && styles.acceptButtonNoActive,
                  ]}
                  glassEffectStyle={accepted === false ? 'regular' : 'clear'}
                  tintColor={accepted === false ? Colors.refused : undefined}
                >
                  <XCircle size={20} color={accepted === false ? '#FFF' : Colors.refused} strokeWidth={1.5} />
                  <Text style={[styles.acceptButtonText, accepted === false && styles.acceptButtonTextActive]}>
                    Non, refusée
                  </Text>
                </GlassView>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButtonWrap, (!name.trim() || !address.trim() || accepted === null) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            testID="submit-report"
          >
            <GlassView style={styles.submitButton} glassEffectStyle="regular" tintColor={Colors.accent}>
              <Text style={styles.submitButtonText}>Envoyer le signalement</Text>
            </GlassView>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '400' as const,
  },
  formSection: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 15,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
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
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  acceptButtonYesActive: {
    backgroundColor: Colors.accepted,
    borderColor: Colors.accepted,
  },
  acceptButtonNo: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  acceptButtonNoActive: {
    backgroundColor: Colors.refused,
    borderColor: Colors.refused,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  acceptButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
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
  inputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: Colors.border,
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
    color: Colors.textTertiary,
  },
  suggestionsContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
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
    borderBottomColor: Colors.border,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  suggestionAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
