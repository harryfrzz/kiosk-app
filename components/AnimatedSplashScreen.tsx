import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Image, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  withDelay,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

import * as FileSystem from 'expo-file-system/legacy';

import MandalaArt from './MandalaArt';

// Keep the splash screen visible while fetching resources
SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');
const LOGO_WIDTH = width * 0.75;
const LOGO_HEIGHT = LOGO_WIDTH * 0.29; // exact 5504x1599 image ratio

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [mandalaXml, setMandalaXml] = useState<string | null>(null);
  const containerOpacity = useSharedValue(1);
  const shimmerTranslateX = useSharedValue(-LOGO_WIDTH * 1.5);
  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);

  // Ripple circle animation for "TAP TO CONTINUE"
  const rippleScale = useSharedValue(0.7);
  const rippleOpacity = useSharedValue(0.8);

  useEffect(() => {
    async function prepare() {
      try {
        const mandalaAsset = Asset.fromModule(require('../assets/mandala_gold.svg'));
        await mandalaAsset.downloadAsync();
        
        if (mandalaAsset.localUri) {
          const xml = await FileSystem.readAsStringAsync(mandalaAsset.localUri);
          setMandalaXml(xml);
        }

        await Asset.loadAsync([
          require('../assets/annakshetra.png'),
        ]);
      } catch (e) {
        console.warn('Error loading assets', e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const finishAnimation = useCallback(() => {
    // 600ms fade-out
    containerOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, [onAnimationComplete, containerOpacity]);

  useEffect(() => {
    if (isAppReady) {
      // Hide native splash screen seamlessly
      SplashScreen.hideAsync();

      // Entrance animation for logo
      logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
      logoOpacity.value = withTiming(1, { duration: 800 });

      // Run shimmer glint after logo appears
      shimmerTranslateX.value = withDelay(
        800,
        withTiming(LOGO_WIDTH * 1.5, { duration: 1000, easing: Easing.linear })
      );

      // Expanding golden touch ripple animation loop
      rippleScale.value = withRepeat(
        withTiming(1.8, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      rippleOpacity.value = withRepeat(
        withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
    }
    return () => {
      cancelAnimation(rippleScale);
      cancelAnimation(rippleOpacity);
    };
  }, [isAppReady, logoScale, logoOpacity, shimmerTranslateX, rippleScale, rippleOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }, { rotate: '15deg' }],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  if (!isAppReady) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Pressable style={styles.pressableArea} onPress={finishAnimation}>
        <View style={styles.mandalaContainer}>
          <MandalaArt size={width * 1.8} xml={mandalaXml} />
        </View>

        <Animated.View style={[styles.stripContainer, animatedLogoStyle]}>
          <BlurView intensity={60} tint="light" style={styles.fullWidthStrip}>
            <View style={styles.stripWarmOverlay} />
            
            <View style={styles.logoMask}>
              <Image 
                source={require('../assets/annakshetra.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              {/* Shimmer Effect */}
              <Animated.View style={[styles.shimmer, animatedShimmerStyle]} />
            </View>
          </BlurView>
        </Animated.View>

        {/* Bottom Tap to Continue Prompt */}
        <View style={styles.bottomPromptContainer}>
          <View style={styles.rippleWrapper}>
            <Animated.View style={[styles.rippleCircle, animatedRippleStyle]} />
            <View style={styles.centerDot} />
          </View>
          <Text style={styles.continueText}>TAP TO CONTINUE</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF6EE', // Warm Pearl Ivory
  },
  pressableArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mandalaContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripContainer: {
    width: '100%',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  fullWidthStrip: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripWarmOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Premium translucent glassmorphic backdrop
  },
  logoMask: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    position: 'absolute',
    top: -LOGO_HEIGHT,
    bottom: -LOGO_HEIGHT,
    width: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bottomPromptContainer: {
    position: 'absolute',
    bottom: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rippleCircle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  continueText: {
    color: '#8A6D1B',
    fontSize: 12,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
});
