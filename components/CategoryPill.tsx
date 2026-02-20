import React, { useRef, useCallback } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Colors from '@/constants/colors';

interface CategoryPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CategoryPillComponent({ label, selected, onPress }: CategoryPillProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.pillOuter,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <GlassView
          style={[
            styles.pill,
            selected && styles.pillSelected,
          ]}
          glassEffectStyle={selected ? 'regular' : 'clear'}
          tintColor={selected ? Colors.primary : undefined}
        >
          <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
        </GlassView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default React.memo(CategoryPillComponent);

const styles = StyleSheet.create({
  pillOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
