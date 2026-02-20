import React, { useRef, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { GlassView } from 'expo-glass-effect';
import Colors from '@/constants/colors';

interface FABProps {
  onPress: () => void;
}

function FloatingActionButton({ onPress }: FABProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      style={styles.wrapper}
      testID="fab-add-report"
    >
      <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
        <GlassView style={styles.glassInner} glassEffectStyle="regular" tintColor={Colors.accent}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </GlassView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default React.memo(FloatingActionButton);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
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
    backgroundColor: Colors.accent,
  },
});
