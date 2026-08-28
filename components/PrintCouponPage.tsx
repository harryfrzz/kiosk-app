import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MandalaArt from './MandalaArt';
import { FacultyUser, MealDefinition } from '../mockData';

interface PrintCouponPageProps {
  user: FacultyUser;
  meal: MealDefinition;
  price: number;
  onFinish: () => void;
}

const AUTO_RESET_SECONDS = 10;

// The mandala size (matches the bg mandala)
const M = 700;
const HALF = M / 2;

// Ticket dims
const TICKET_W = 420;
const TICKET_H = 340;

export default function PrintCouponPage({
  user,
  meal,
  price,
  onFinish,
}: PrintCouponPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [statusText, setStatusText] = useState('Printing…');
  const [isPrinted, setIsPrinted] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shared animated values
  const mandalaRotate = useSharedValue(0);   // deg, continuous
  const topHalfY = useSharedValue(0);     // top half slides UP by this
  const bottomHalfY = useSharedValue(0);     // bottom half slides DOWN by this
  const paperY = useSharedValue(-TICKET_H); // ticket feeds down from 0 inside clipped viewport
  const paperOpacity = useSharedValue(0);

  const orderNumberRef = useRef(`#AK-${Math.floor(1000 + Math.random() * 9000)}`);
  const dateStringRef = useRef(
    new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  );

  useEffect(() => {
    // 1 — Continuous slow rotation
    mandalaRotate.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1, false
    );

    // 2 — 500ms in: snap the mandala open (snappy spring)
    const splitT = setTimeout(() => {
      const SPLIT = 60;
      topHalfY.value = withSpring(-SPLIT, { damping: 18, stiffness: 160 });
      bottomHalfY.value = withSpring(SPLIT, { damping: 18, stiffness: 160 });
    }, 500);

    // 3 — 750ms in: paper starts feeding out of the gap
    const printT = setTimeout(() => {
      paperOpacity.value = withTiming(1, { duration: 150 });
      paperY.value = withTiming(0, {
        duration: 2400,
        easing: Easing.bezier(0.22, 0.61, 0.36, 1.0), // slow start → steady feed
      }, () => {
        runOnJS(setIsPrinted)(true);
        runOnJS(setStatusText)('Coupon Printed!');
      });
    }, 750);

    // 4 — Countdown
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        return next <= 0 ? 0 : next;
      });
    }, 1000);

    return () => {
      clearTimeout(splitT);
      clearTimeout(printT);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onFinish();
    }
  }, [countdown]);

  // ─── Derived animated styles ────────────────────────────────────────────────
  const rotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${mandalaRotate.value}deg` }],
  }));
  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topHalfY.value }],
  }));
  const botStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomHalfY.value }],
  }));
  const ticketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: paperY.value }],
    opacity: paperOpacity.value,
  }));
  // Viewport top tracks bottom edge of the top mandala half (HALF + topHalfY)
  const viewportTopStyle = useAnimatedStyle(() => ({
    top: HALF + topHalfY.value,
  }));

  const formatPrice = (amt: number) => amt === 0 ? 'FREE' : `₹${amt.toFixed(2)}`;

  return (
    <View style={styles.container}>
      {/* Faint static bg mandala */}
      <View style={[styles.bgMandala, { left: width / 2 - 400, top: height / 2 - 400 }]}>
        <MandalaArt size={800} xml={null} />
      </View>

      <View style={[styles.content, { paddingTop: Math.max(24, insets.top + 12) }]}>
        {/* Status */}
        <Text style={styles.statusTitle}>{statusText}</Text>
        <Text style={styles.statusSub}>
          {isPrinted ? 'Collect your pass from the dispenser' : 'Mandala dispensing your thermal pass…'}
        </Text>

        {/* ── Mandala Split + Printer Stage ─────────────────────────────────── */}
        <View style={[styles.stage, { width: M, height: M }]}>

          {/* TOP half of mandala — clips top 50% and slides up */}
          <Animated.View style={[styles.halfContainerTop, topStyle]}>
            <Animated.View style={[styles.mandalaLayer, rotStyle]}>
              <MandalaArt size={M} animated={false} />
            </Animated.View>
          </Animated.View>

          {/* BOTTOM half of mandala — clips bottom 50% and slides down */}
          <Animated.View style={[styles.halfContainerBot, botStyle]}>
            <Animated.View style={[styles.mandalaLayerBot, rotStyle]}>
              <MandalaArt size={M} animated={false} />
            </Animated.View>
          </Animated.View>

          {/* ── Coupon viewport — tracks bottom edge of top mandala half ─────── */}
          {/*
              `viewportTopStyle` animates top = HALF + topHalfY (negative),
              so the viewport stays glued to the sliding-up bottom edge of
              the top mandala half. The coupon emerges exactly from there.
          */}
          <Animated.View style={[styles.printViewport, { width: TICKET_W }, viewportTopStyle]}>
            <Animated.View style={ticketStyle}>
              {/* Black & White thermal receipt */}
              <View style={styles.ticket}>
                <View style={styles.tktHeader}>
                  <Text style={styles.tktBrand}>ANNAKSHETRA MEAL PASS</Text>
                </View>

                <View style={styles.tktHr} />

                <View style={styles.tktBody}>
                  <View style={styles.tktRow}>
                    <Text style={styles.lbl}>FACULTY NAME</Text>
                    <Text style={styles.valLg}>{user.name}</Text>
                  </View>

                  <View style={styles.tktInlineRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lbl}>DEPARTMENT</Text>
                      <Text style={styles.valSm}>{user.department}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.lbl}>MEAL TYPE</Text>
                      <View style={styles.mealBadge}>
                        <Text style={styles.mealBadgeTxt}>{meal.label.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tktInlineRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lbl}>DATE & TIME</Text>
                      <Text style={styles.valSm}>{dateStringRef.current}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.lbl}>PASS NO.</Text>
                      <Text style={styles.valSm}>{orderNumberRef.current}</Text>
                    </View>
                  </View>

                  <View style={styles.tktDashedHr} />

                  <View style={styles.tktPriceRow}>
                    <Text style={styles.priceLabel}>AMOUNT PAID</Text>
                    <Text style={styles.priceValue}>{formatPrice(price)}</Text>
                  </View>
                </View>

                {/* Perforated tear edge */}
                <View style={styles.perf}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <View key={i} style={styles.perfDot} />
                  ))}
                </View>
              </View>
            </Animated.View>
          </Animated.View>

        </View>
        {/* ─────────────────────────────────────────────────────────────────── */}

        {/* Countdown */}
        <Text style={styles.cdText}>
          Returning to home in <Text style={styles.cdNum}>{countdown}s</Text>
        </Text>
      </View>

      {/* Pinned logo */}
      <View
        style={[styles.footer, { paddingBottom: Math.max(10, insets.bottom), pointerEvents: 'none' }]}
      >
        <Image
          source={require('../assets/branding/annakshetra.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EE',
    overflow: 'hidden',
  },
  bgMandala: {
    position: 'absolute',
    opacity: 0.07,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  statusTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 30,
    fontWeight: '800',
    color: '#2C2C2C',
    textAlign: 'center',
  },
  statusSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Printer stage ──────────────────────────────────────────────────────────
  stage: {
    marginTop: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top half: clips upper 50% of the mandala, pulled upward
  halfContainerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HALF,
    overflow: 'hidden',
    zIndex: 10,
  },
  mandalaLayer: {
    width: M,
    height: M,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.88,
  },

  // Bottom half: shows lower 50% of the mandala, pushed downward
  halfContainerBot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HALF,
    overflow: 'hidden',
    zIndex: 10,
  },
  mandalaLayerBot: {
    width: M,
    height: M,
    alignItems: 'center',
    justifyContent: 'center',
    // Shift the mandala up inside the bottom container so bottom 50% is visible
    marginTop: -HALF,
    opacity: 0.88,
  },

  // ── Coupon viewport (clipped, top tracks bottom edge of top mandala half) ──
  printViewport: {
    position: 'absolute',
    // `top` is driven by viewportTopStyle (animated)
    height: TICKET_H + 20,
    overflow: 'hidden',
    zIndex: 20,
    alignItems: 'center',
  },

  // ── Black & White thermal ticket ───────────────────────────────────────────
  ticket: {
    width: TICKET_W,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 16px 40px rgba(0,0,0,0.28)' }
      : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
        elevation: 14,
      }),
  } as any,
  tktHeader: {
    alignItems: 'center',
    marginBottom: 2,
  },
  tktBrand: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  tktHr: {
    height: 2,
    backgroundColor: '#000',
    marginVertical: 10,
  },
  tktBody: {
    gap: 9,
  },
  tktRow: { gap: 2 },
  tktInlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  lbl: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#555',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  valLg: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 21,
    fontWeight: '800',
    color: '#000',
  },
  valSm: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  mealBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  mealBadgeTxt: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.4,
  },
  tktDashedHr: {
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#444',
    marginVertical: 2,
  },
  tktPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.9,
  },
  priceValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
  },
  perf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 2,
  },
  perfDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#222',
  },

  // ── Countdown & Footer ─────────────────────────────────────────────────────
  cdText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
  cdNum: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#D4AF37',
    fontWeight: '800',
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: 'rgba(250,246,238,0.88)',
    zIndex: 30,
  },
  footerLogo: {
    width: 200,
    height: 62,
    opacity: 0.85,
  },
});
