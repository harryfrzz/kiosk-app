import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Vibration, LayoutChangeEvent, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import MandalaArt from './MandalaArt';

interface KioskCardProps {
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  /** 'stacked' puts the chevron bottom-right; 'row' sits it beside the text. */
  layout?: 'stacked' | 'row';
  mandalaPosition?: 'top-bottom' | 'right' | 'bottom' | 'none';
  mandalaScale?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KioskCard({
  title,
  description,
  onPress,
  disabled = false,
  style,
  contentStyle,
  titleStyle,
  layout = 'stacked',
  mandalaPosition = 'top-bottom',
  mandalaScale = 2.2,
}: KioskCardProps) {
  const isRow = layout === 'row';
  const [cardWidth, setCardWidth] = useState<number>(220);
  const [cardHeight, setCardHeight] = useState<number>(220);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Clamp the source width so full-width grid cards don't get an oversized arch
  const standardMandalaSize = Math.round(Math.min(cardWidth, 270) * 1.4);
  const standardMandalaHalf = Math.round(standardMandalaSize / 2);

  // Increased mandala size for right-side placement
  const rightMandalaSize = Math.round(Math.max(cardWidth * 0.65, cardHeight * mandalaScale, 450));
  const rightMandalaHalf = Math.round(rightMandalaSize / 2);

  // Bigger size for bottom-only mandala placement
  const bottomMandalaSize = Math.round(Math.max(cardWidth * 1.5, 360));
  const bottomMandalaHalf = Math.round(bottomMandalaSize / 2);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width: measuredWidth, height: measuredHeight } = e.nativeEvent.layout;
    if (measuredWidth > 0 && Math.abs(measuredWidth - cardWidth) > 2) {
      setCardWidth(measuredWidth);
    }
    if (measuredHeight > 0 && Math.abs(measuredHeight - cardHeight) > 2) {
      setCardHeight(measuredHeight);
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
      style={[styles.container, style, animatedStyle]}
    >
      <BlurView intensity={45} tint="light" style={[styles.blurContainer, isRow && styles.blurContainerRow, contentStyle]}>
        {/* Top/Bottom Mandala Arches */}
        {!isRow && mandalaPosition === 'top-bottom' && (
          <>
            <View
              style={[
                styles.mandalaTopContainer,
                {
                  top: -standardMandalaHalf,
                  pointerEvents: 'none',
                } as any,
              ]}
            >
              <MandalaArt size={standardMandalaSize} animated={false} />
            </View>

            <View
              style={[
                styles.mandalaBottomContainer,
                {
                  bottom: -standardMandalaHalf,
                  pointerEvents: 'none',
                } as any,
              ]}
            >
              <MandalaArt size={standardMandalaSize} animated={false} />
            </View>
          </>
        )}

        {/* Bottom Only Mandala (Bigger size) */}
        {!isRow && mandalaPosition === 'bottom' && (
          <View
            style={[
              styles.mandalaBottomContainer,
              {
                bottom: -bottomMandalaHalf,
                pointerEvents: 'none',
              } as any,
            ]}
          >
            <MandalaArt size={bottomMandalaSize} animated={false} />
          </View>
        )}

        {/* Right Side Mandala (1.5x scale, single side) */}
        {!isRow && mandalaPosition === 'right' && (
          <View
            style={[
              styles.mandalaRightContainer,
              {
                right: -rightMandalaHalf,
                pointerEvents: 'none',
              } as any,
            ]}
          >
            <MandalaArt size={rightMandalaSize} animated={false} />
          </View>
        )}

        {/* Content Section (Top-left inside card) */}
        <View style={[styles.contentSection, isRow && styles.contentSectionRow]}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Action Chevron Button (Bottom-right, or beside the text in row layout) */}
        <View style={[styles.arrowContainer, isRow && styles.arrowContainerRow]}>
          <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
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
    alignItems: 'stretch',
    justifyContent: 'space-between',
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
  mandalaRightContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.28,
  },
  blurContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 0,
  },
  contentSection: {
    alignItems: 'flex-start',
    zIndex: 5,
    width: '100%',
  },
  contentSectionRow: {
    flex: 1,
    width: 'auto',
    paddingRight: 16,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    fontWeight: '800',
    color: '#2C2C2C',
    textAlign: 'left',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  description: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
    lineHeight: 19,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    zIndex: 5,
  },
  arrowContainerRow: {
    alignSelf: 'center',
  },
});
