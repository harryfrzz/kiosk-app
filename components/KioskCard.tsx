import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Vibration, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import MandalaArt from './MandalaArt';

interface KioskCardProps {
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KioskCard({ title, description, onPress, disabled = false }: KioskCardProps) {
  const [cardWidth, setCardWidth] = useState<number>(220);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const mandalaSize = Math.round(cardWidth * 1.4);
  const mandalaHalf = Math.round(mandalaSize / 2);

  const handleLayout = (e: LayoutChangeEvent) => {
    const measuredWidth = e.nativeEvent.layout.width;
    if (measuredWidth > 0 && Math.abs(measuredWidth - cardWidth) > 2) {
      setCardWidth(measuredWidth);
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    if (Platform.OS === 'android') {
      Vibration.vibrate(10);
    }
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : opacity.value,
    };
  });

  return (
    <AnimatedPressable
      onLayout={handleLayout}
      onPress={!disabled ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <BlurView intensity={45} tint="light" style={styles.blurContainer}>
        {/* Static Top Mandala Arch (Perfectly centered on all devices) */}
        <View
          style={[
            styles.mandalaTopContainer,
            {
              top: -mandalaHalf,
              pointerEvents: 'none',
            } as any,
          ]}
        >
          <MandalaArt size={mandalaSize} animated={false} />
        </View>

        {/* Static Bottom Mandala Arch (Perfectly centered on all devices) */}
        <View
          style={[
            styles.mandalaBottomContainer,
            {
              bottom: -mandalaHalf,
              pointerEvents: 'none',
            } as any,
          ]}
        >
          <MandalaArt size={mandalaSize} animated={false} />
        </View>

        {/* Content Section (Centered inside card between top & bottom arches) */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Action Chevron Button */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
          </View>
        </View>
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 170,
    maxWidth: 270,
    marginHorizontal: 8,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#FAF6EE',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 20px rgba(212, 175, 55, 0.25)' }
      : {
          shadowColor: 'rgba(212, 175, 55, 0.4)',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
        }),
  } as any,
  blurContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    minHeight: 380,
  },
  mandalaTopContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.28,
  },
  mandalaBottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.28,
  },
  contentSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    zIndex: 5,
    width: '100%',
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  description: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 6,
    marginBottom: 20,
  },
  arrowContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
});
