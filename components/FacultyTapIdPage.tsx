import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MandalaArt from './MandalaArt';

interface FacultyTapIdPageProps {
  onBack: () => void;
  onReset: () => void;
  onCardTapped: () => void;
}

type TapState = 'idle' | 'verifying';

export default function FacultyTapIdPage({ onBack, onReset, onCardTapped }: FacultyTapIdPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [tapState, setTapState] = useState<TapState>('idle');
  const verifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Card bob & fade animations
  const cardTranslateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // ── Verifying state & animations
  const [promptTitle, setPromptTitle] = useState('Tap your ID Card below');
  const [promptSubtext, setPromptSubtext] = useState('Hold your Faculty / Staff smart card near the scanner');

  const mandalaRotate = useSharedValue(0);
  const tickScale = useSharedValue(0);
  const tickOpacity = useSharedValue(0);

  const startIdleAnimations = () => {
    // Card gentle bob
    cardTranslateY.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Continuous 650px Mandala artwork rotation
    mandalaRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  };

  const stopIdleAnimations = () => {
    cancelAnimation(cardTranslateY);
  };

  useEffect(() => {
    startIdleAnimations();
    return () => {
      stopIdleAnimations();
      cancelAnimation(mandalaRotate);
      if (verifyTimer.current) clearTimeout(verifyTimer.current);
    };
  }, []);

  const handleSimulateTap = () => {
    if (tapState !== 'idle') return;
    setTapState('verifying');
    setPromptTitle('Verifying ID Card…');
    setPromptSubtext('Please hold on while we authenticate your card');
    stopIdleAnimations();

    // Fade out floating ID card into center
    cardOpacity.value = withTiming(0, { duration: 300 });

    // Speed up mandala rotation slightly during verification
    mandalaRotate.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );

    // Pop out tick mark badge in center of mandala after 600ms
    setTimeout(() => {
      setPromptTitle('Card Authenticated!');
      tickOpacity.value = withTiming(1, { duration: 200 });
      tickScale.value = withSequence(
        withSpring(1.25, { damping: 8, stiffness: 220 }),
        withSpring(1.0, { damping: 12, stiffness: 300 })
      );
    }, 600);

    // Navigate to next screen after 1800ms
    verifyTimer.current = setTimeout(() => {
      runOnJS(onCardTapped)();
    }, 1800);
  };

  // Animated styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));
  const mandalaRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${mandalaRotate.value}deg` }],
  }));
  const tickAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tickScale.value }],
    opacity: tickOpacity.value,
  }));

  const isLargeScreen = width > 768;

  return (
    <View style={styles.container}>
      {/* Background mandala */}
      <View style={[styles.mandalaContainer, { left: width / 2 - 400, top: height / 2 - 400 }]}>
        <MandalaArt size={800} />
      </View>

      {/* Header */}
      {/* Title only — the controls live in the bottom bar, within thumb reach. */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faculty / Staff Coupon</Text>
      </View>

      {/* Main content */}
      <View style={styles.body}>
        {/* Scanner area with 650px rotating mandala */}
        <Pressable onPress={handleSimulateTap} style={styles.scannerArea}>
          {/* Rotating 650px Mandala Artwork */}
          <Animated.View style={[styles.mandalaRotateBox, mandalaRotateStyle]}>
            <MandalaArt size={650} animated={false} />
          </Animated.View>

          {/* Center NFC scanner base */}
          <BlurView intensity={50} tint="light" style={styles.nfcBase}>
            <View style={styles.nfcInner}>
              <Ionicons name="wifi-outline" size={36} color="#D4AF37" style={styles.nfcIcon} />
            </View>
          </BlurView>

          {/* Floating ID card */}
          <Animated.View style={[styles.cardWrapper, cardStyle]}>
            <BlurView intensity={60} tint="light" style={styles.idCard}>
              <View style={styles.idCardStripe} />
              <View style={styles.idCardBody}>
                <View style={styles.idChip} />
                <View style={styles.idLines}>
                  <View style={styles.idLine} />
                  <View style={[styles.idLine, { width: '60%', opacity: 0.5 }]} />
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Gold Checkmark Badge appearing directly in center of the main Mandala */}
          <Animated.View style={[styles.tickBadge, tickAnimatedStyle]}>
            <Ionicons name="checkmark-sharp" size={54} color="#8A6D1B" />
          </Animated.View>
        </Pressable>

        {/* Text prompt */}
        <Text style={[styles.promptTitle, { fontSize: isLargeScreen ? 32 : 26 }]}>
          {promptTitle}
        </Text>
        <Text style={styles.promptSubtitle}>
          {promptSubtext}
        </Text>

        {/* Simulate button */}
        <Pressable
          onPress={handleSimulateTap}
          disabled={tapState !== 'idle'}
          style={({ pressed }) => [
            styles.simulateBtn,
            pressed && styles.simulateBtnPressed,
            tapState !== 'idle' && styles.simulateBtnDisabled,
          ]}
        >
          <Ionicons name="card-outline" size={20} color="#8A6D1B" />
          <Text style={styles.simulateBtnText}>Simulate ID Tap</Text>
        </Pressable>
      </View>

      {/* Pinned Bottom Footer Logo */}
      {/* Pinned bottom control bar — Back and Start Over flanking the logo */}
      <View style={[styles.pinnedFooter, { paddingBottom: Math.max(10, insets.bottom) }]}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color="#8A6D1B" />
          <Text style={styles.controlBtnText}>Back</Text>
        </Pressable>

        <Image
          source={require('../assets/branding/annakshetra.png')}
          style={[
            styles.footerLogo,
            { width: width > 768 ? 200 : 130, height: width > 768 ? 62 : 40 },
          ]}
          resizeMode="contain"
        />

        <Pressable
          onPress={onReset}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
          hitSlop={12}
        >
          <Ionicons name="refresh" size={18} color="#8A6D1B" />
          <Text style={styles.controlBtnText}>Start Over</Text>
        </Pressable>
      </View>
    </View>
  );
}

const RING_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EE',
    overflow: 'hidden',
  },
  mandalaContainer: {
    position: 'absolute',
    opacity: 0.1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(250, 246, 238, 0.92)',
    zIndex: 10,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.32)',
  },
  controlBtnPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(212, 175, 55, 0.26)',
  },
  controlBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 3,
  },
  headerTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#2C2C2C',
    fontWeight: '800',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  scannerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 380,
    width: 380,
  },
  nfcBase: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'rgba(250, 246, 238, 0.6)',
  },
  nfcInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    width: '100%',
    height: '100%',
    borderRadius: RING_SIZE / 2,
  },
  nfcIcon: {
    transform: [{ rotate: '90deg' }],
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  idCard: {
    width: 130,
    height: 85,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 24px rgba(212, 175, 55, 0.35)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 10,
        }),
  } as any,
  idCardStripe: {
    height: 18,
    backgroundColor: '#8A6D1B',
    opacity: 0.85,
  },
  idCardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  idChip: {
    width: 24,
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.8)',
  },
  idLines: {
    flex: 1,
    gap: 6,
  },
  idLine: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(44, 44, 44, 0.2)',
    width: '100%',
  },
  promptTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontWeight: '800',
    color: '#2C2C2C',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  promptSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginTop: 8,
  },
  simulateBtnPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
  },
  simulateBtnDisabled: {
    opacity: 0.4,
  },
  simulateBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#8A6D1B',
    fontWeight: '700',
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    zIndex: 50,
  },
  verifyingBlurBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 246, 238, 0.82)',
  },
  verifyingContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  mandalaRotateWrapper: {
    width: 650,
    height: 650,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mandalaRotateBox: {
    position: 'absolute',
    width: 650,
    height: 650,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.95,
  },
  tickBadge: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 10px 28px rgba(212, 175, 55, 0.35)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 18,
          elevation: 12,
        }),
  },
  verifyingText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    color: '#2C2C2C',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  verifyingSubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    maxWidth: 280,
  },
  pinnedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    zIndex: 20,
  },
  footerLogo: {
    opacity: 0.85,
  },
}) as any;
