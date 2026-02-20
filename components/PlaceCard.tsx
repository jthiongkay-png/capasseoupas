import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, CheckCircle, XCircle, ChevronRight, UtensilsCrossed, Coffee, Wine, ShoppingBag, Hotel, Fuel, Apple, Ticket, Heart, Car } from 'lucide-react-native';
import { Place, PlaceCategory, CATEGORY_LABELS } from '@/types';
import Colors from '@/constants/colors';

const CATEGORY_ICON_MAP: Record<PlaceCategory, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  bar: Wine,
  shop: ShoppingBag,
  hotel: Hotel,
  gas_station: Fuel,
  grocery: Apple,
  entertainment: Ticket,
  health: Heart,
  transport: Car,
  other: MapPin,
};

interface PlaceCardProps {
  place: Place;
  onPress: (place: Place) => void;
  compact?: boolean;
}

function PlaceCardComponent({ place, onPress, compact = false }: PlaceCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const totalReports = place.reportsAccepted + place.reportsRefused;
  const acceptRate = totalReports > 0 ? Math.round((place.reportsAccepted / totalReports) * 100) : 0;

  const IconComponent = CATEGORY_ICON_MAP[place.category] || MapPin;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(place)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.compactCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.compactIcon}>
            <IconComponent size={16} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.compactAddress} numberOfLines={1}>{place.address}</Text>
          </View>
          <View style={[styles.compactBadge, { backgroundColor: place.accepted ? Colors.acceptedLight : Colors.refusedLight }]}>
            {place.accepted ? (
              <CheckCircle size={14} color={Colors.accepted} strokeWidth={1.5} />
            ) : (
              <XCircle size={14} color={Colors.refused} strokeWidth={1.5} />
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(place)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={`place-card-${place.id}`}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <IconComponent size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.category}>{CATEGORY_LABELS[place.category]}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: place.accepted ? Colors.acceptedLight : Colors.refusedLight }]}>
            {place.accepted ? (
              <CheckCircle size={14} color={Colors.accepted} strokeWidth={1.5} />
            ) : (
              <XCircle size={14} color={Colors.refused} strokeWidth={1.5} />
            )}
            <Text style={[styles.statusText, { color: place.accepted ? Colors.accepted : Colors.refused }]}>
              {place.accepted ? 'Accepté' : 'Refusé'}
            </Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={13} color={Colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{acceptRate}%</Text>
              <Text style={styles.statLabel}>acceptation</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReports}</Text>
              <Text style={styles.statLabel}>signalements</Text>
            </View>
          </View>
          <ChevronRight size={16} color={Colors.textTertiary} strokeWidth={1.5} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default React.memo(PlaceCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  category: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
    fontWeight: '400' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
    paddingLeft: 2,
  },
  address: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    fontWeight: '400' as const,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '400' as const,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.searchBg,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 10,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  compactAddress: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  compactBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
