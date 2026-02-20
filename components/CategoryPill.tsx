import React, { useRef, useCallback, useMemo } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';

interface CategoryPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CategoryPillComponent({ label, selected, onPress }: CategoryPillProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <View
          style={[
            styles.pill,
            selected && styles.pillSelected,
          ]}
        >
          <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default React.memo(CategoryPillComponent);

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  pillOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.searchBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
