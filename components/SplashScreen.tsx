import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions, Image, Text, Platform } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
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

import * as Font from 'expo-font';
import { Outfit_400Regular, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';

import MandalaArt from './MandalaArt';

// Keep the splash screen visible while fetching resources
ExpoSplashScreen.preventAutoHideAsync();

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const { width } = useWindowDimensions();
  const LOGO_WIDTH = Math.min(width * 0.75, 500);
  const LOGO_HEIGHT = LOGO_WIDTH * 0.29;

  const [isAppReady, setIsAppReady] = useState(false);
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
        await Font.loadAsync({
          Outfit_400Regular,
          Outfit_600SemiBold,
          BricolageGrotesque_700Bold,
          BricolageGrotesque_800ExtraBold,
        });

        await Asset.loadAsync([
          require('../assets/branding/annakshetra.png'),
          require('../assets/vectors/mandala_gold.png'),
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
      ExpoSplashScreen.hideAsync();

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
    return <View style={styles.container} />;
  }

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Pressable style={styles.pressableArea} onPress={finishAnimation}>
        <View style={styles.mandalaContainer}>
          <MandalaArt size={width * 1.8} />
        </View>

        <Animated.View style={[styles.stripContainer, animatedLogoStyle]}>
          <BlurView intensity={60} tint="light" style={styles.fullWidthStrip}>
            <View style={styles.stripWarmOverlay} />
            
            <View style={[styles.logoMask, { width: LOGO_WIDTH, height: LOGO_HEIGHT }]}>
              <Image 
                source={require('../assets/branding/annakshetra.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              {/* Shimmer Effect */}
              <Animated.View style={[styles.shimmer, animatedShimmerStyle, { top: -LOGO_HEIGHT, bottom: -LOGO_HEIGHT }]} />
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
    overflow: 'hidden',
    zIndex: 9999,
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
    elevation: 8,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)' }
      : {
          shadowColor: 'rgba(0,0,0,0.08)',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
        }),
  } as any,
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
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    fontSize: 12,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
});
