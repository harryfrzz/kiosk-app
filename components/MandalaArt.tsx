import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface MandalaArtProps {
  size?: number;
  animated?: boolean;
}

/**
 * The mandala is a pre-rasterized PNG rather than the source SVG.
 *
 * mandala_gold.svg has 1234 <path> elements, and SvgXml turns every one of them
 * into a native view. A screen that draws four mandalas (a background plus three
 * cards) was building ~18k views and dropping frames at a 38ms median. The PNG
 * is a single view, so it costs the same no matter how many are on screen.
 *
 * assets/vectors/mandala_gold.svg is kept as the master artwork — re-export it at
 * 2048x2048 if the art ever changes.
 */
const MANDALA_SOURCE = require('../assets/vectors/mandala_gold.png');

export default function MandalaArt({ size = 300, animated = true }: MandalaArtProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (!animated) {
      rotation.value = 0;
      return;
    }
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 120000, // Very slow, majestic 2-minute rotation
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(rotation);
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.svgWrapper, animatedStyle]}>
        <Image
          source={MANDALA_SOURCE}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
});
