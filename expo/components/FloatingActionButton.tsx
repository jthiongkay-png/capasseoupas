import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '@/constants/colors';

interface FABProps {
  onPress: () => void;
  bottomOffset?: number;
}

function FloatingActionButton({ onPress, bottomOffset = 0 }: FABProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.wrapper, { bottom: 24 + bottomOffset }]}
      testID="fab-add-report"
    >
      <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.glassInner}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default React.memo(FloatingActionButton);

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  glassInner: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
});
