import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
  withSequence,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COUNT = 20;

// Helper to get random number
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const Particle = ({ index }: { index: number }) => {
  const startX = random(0, SCREEN_WIDTH);
  const startY = SCREEN_HEIGHT + random(10, 100);
  const endX = startX + random(-50, 50);
  const duration = random(6000, 12000);
  const delay = random(0, 5000);
  const size = random(2, 6);
  const maxOpacity = random(0.3, 0.8);

  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-50, {
          duration,
          easing: Easing.linear,
        }),
        -1, // infinite
        false // don't reverse
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(endX, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(startX, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(maxOpacity, { duration: duration * 0.2 }),
          withTiming(maxOpacity, { duration: duration * 0.6 }),
          withTiming(0, { duration: duration * 0.2 })
        ),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function GoldenParticles() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#D4AF37',
    shadowColor: '#C59B27',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});
