import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MandalaArt from './MandalaArt';
import { MealDefinition, formatINR, spotCouponTotal } from '../mockData';

interface SpotPaymentPageProps {
  meal: MealDefinition;
  quantity: number;
  onBack: () => void;
  onReset: () => void;
  onPaymentComplete: () => void;
  isOffline?: boolean;
}

type PaymentMethod = 'upi' | 'cash';

/** How long the mock gateway "processes" before succeeding. */
const PROCESSING_MS = 1800;

const METHODS: {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'upi', label: 'UPI', hint: 'Scan the code with any UPI app', icon: 'qr-code-outline' },
  { id: 'cash', label: 'Cash', hint: 'Pay the counter attendant', icon: 'cash-outline' },
];

export default function SpotPaymentPage({
  meal,
  quantity,
  onBack,
  onReset,
  onPaymentComplete,
  isOffline = false,
}: SpotPaymentPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = spotCouponTotal(meal, quantity);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePay = () => {
    if (isProcessing || isOffline) return;
    setIsProcessing(true);
    // TODO: replace with the real UPI gateway callback once the backend is ready.
    timerRef.current = setTimeout(onPaymentComplete, PROCESSING_MS);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mandalaContainer, { left: width / 2 - 400, top: height / 2 - 400 }]}>
        <MandalaArt size={800} />
      </View>

      {/* Title block at the top; the controls live in the bottom bar. */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SPOT COUPONS</Text>
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerSubtitle}>
          {meal.label} · {quantity} {quantity === 1 ? 'coupon' : 'coupons'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(130, insets.bottom + 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Order summary ───────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.card}>
          <BlurView intensity={55} tint="light" style={styles.cardBlur}>
            <View style={styles.summaryRow}>
              <View style={styles.mealIcon}>
                <Ionicons name="fast-food-outline" size={28} color="#D4AF37" />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryMeal}>{meal.label}</Text>
                <Text style={styles.summaryUnit}>
                  {formatINR(meal.basePrice)} × {quantity}{' '}
                  {quantity === 1 ? 'coupon' : 'coupons'}
                </Text>
              </View>
              <View style={styles.qtyPill}>
                <Text style={styles.qtyPillText}>×{quantity}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>AMOUNT DUE</Text>
              <Text style={styles.totalValue}>{formatINR(total)}</Text>
            </View>

            <View style={[styles.cardMandala, { pointerEvents: 'none' }]}>
              <MandalaArt size={360} animated={false} />
            </View>
          </BlurView>
        </View>

        {/* ── Method picker ───────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.methodRow}>
          {METHODS.map((m) => {
            const isSelected = method === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethod(m.id)}
                disabled={isProcessing}
                style={({ pressed }) => [
                  styles.methodCard,
                  isSelected && styles.methodCardSelected,
                  pressed && !isProcessing && styles.methodCardPressed,
                ]}
              >
                <BlurView intensity={45} tint="light" style={styles.methodCardBlur}>
                  <View style={[styles.methodIcon, isSelected && styles.methodIconSelected]}>
                    <Ionicons name={m.icon} size={26} color={isSelected ? '#8A6D1B' : '#D4AF37'} />
                  </View>
                  <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                    {m.label}
                  </Text>
                  <Text style={styles.methodHint}>{m.hint}</Text>
                  <View style={styles.methodCheck}>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={isSelected ? '#8A6D1B' : '#CCC'}
                    />
                  </View>
                </BlurView>
              </Pressable>
            );
          })}
        </View>

        {/* ── UPI QR ──────────────────────────────────────────────────────── */}
        {method === 'upi' && (
          <View style={styles.qrCard}>
            <BlurView intensity={55} tint="light" style={styles.qrCardBlur}>
              <View style={styles.qrFrame}>
                <Ionicons name="qr-code" size={168} color="#2C2C2C" />
              </View>
              <Text style={styles.qrCaption}>Scan to pay {formatINR(total)}</Text>
              <Text style={styles.qrSubCaption}>
                Demo placeholder — a live QR is issued by the gateway.
              </Text>
            </BlurView>
          </View>
        )}

        {method === 'cash' && (
          <View style={styles.cashNotice}>
            <Ionicons name="information-circle-outline" size={20} color="#8A6D1B" />
            <Text style={styles.cashNoticeText}>
              Hand {formatINR(total)} to the counter attendant, then confirm below to print.
            </Text>
          </View>
        )}

        {isOffline && (
          <View style={styles.offlineNotice}>
            <Ionicons name="cloud-offline" size={20} color="#C62828" />
            <Text style={styles.offlineNoticeText}>
              Payments are unavailable while the kiosk is offline.
            </Text>
          </View>
        )}

        {/* ── Confirm ─────────────────────────────────────────────────────── */}
        <Pressable
          onPress={handlePay}
          disabled={isProcessing || isOffline}
          style={({ pressed }) => [
            styles.payBtn,
            pressed && !isProcessing && !isOffline && styles.payBtnPressed,
            (isProcessing || isOffline) && styles.payBtnDisabled,
          ]}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.payBtnText}>Processing…</Text>
            </>
          ) : (
            <>
              <Ionicons
                name={method === 'upi' ? 'shield-checkmark-outline' : 'checkmark-circle-outline'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.payBtnText}>
                {method === 'upi' ? `Pay ${formatINR(total)}` : 'Confirm Cash Payment'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Pinned bottom control bar — Back and Start Over flanking the logo */}
      <View style={[styles.pinnedFooter, { paddingBottom: Math.max(10, insets.bottom) }]}>
        <Pressable
          onPress={onBack}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.controlBtn,
            pressed && !isProcessing && styles.controlBtnPressed,
            isProcessing && styles.controlBtnDisabled,
          ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EE',
    overflow: 'hidden',
  },
  mandalaContainer: {
    position: 'absolute',
    opacity: 0.15,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  eyebrow: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D1B',
    letterSpacing: 1.6,
  },
  headerTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    fontWeight: '800',
    color: '#2C2C2C',
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#777',
    marginTop: 2,
    textAlign: 'center',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#2C2C2C',
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 560,
    marginTop: 14,
    marginBottom: 10,
  },

  // ── Summary card ───────────────────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#FAF6EE',
    elevation: 6,
  },
  cardBlur: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  mealIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  summaryText: {
    flex: 1,
    marginLeft: 14,
  },
  summaryMeal: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#2C2C2C',
  },
  summaryUnit: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  qtyPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  qtyPillText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 17,
    fontWeight: '800',
    color: '#8A6D1B',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 18,
    zIndex: 5,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  totalLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.2,
  },
  totalValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 32,
    fontWeight: '800',
    color: '#8A6D1B',
  },
  cardMandala: {
    position: 'absolute',
    right: -180,
    bottom: -180,
    opacity: 0.15,
  },

  // ── Method picker ──────────────────────────────────────────────────────────
  methodRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 560,
  },
  methodCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#FAF6EE',
  },
  methodCardSelected: {
    borderColor: 'rgba(138, 109, 27, 0.7)',
    borderWidth: 2,
  },
  methodCardPressed: {
    opacity: 0.85,
  },
  methodCardBlur: {
    padding: 16,
    minHeight: 132,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  methodIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  methodIconSelected: {
    backgroundColor: 'rgba(138, 109, 27, 0.16)',
    borderColor: 'rgba(138, 109, 27, 0.45)',
  },
  methodLabel: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    fontWeight: '800',
    color: '#2C2C2C',
    marginTop: 10,
  },
  methodLabelSelected: {
    color: '#8A6D1B',
  },
  methodHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    lineHeight: 17,
  },
  methodCheck: {
    position: 'absolute',
    top: 14,
    right: 14,
  },

  // ── QR ─────────────────────────────────────────────────────────────────────
  qrCard: {
    width: '100%',
    maxWidth: 560,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#FAF6EE',
  },
  qrCardBlur: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  qrFrame: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  qrCaption: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2C2C',
    marginTop: 14,
  },
  qrSubCaption: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // ── Notices ────────────────────────────────────────────────────────────────
  cashNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 560,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cashNoticeText: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#6B5514',
    lineHeight: 20,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 560,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(198, 40, 40, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(198, 40, 40, 0.3)',
  },
  offlineNoticeText: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#8C2020',
    lineHeight: 20,
  },

  // ── Pay ────────────────────────────────────────────────────────────────────
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 560,
    marginTop: 22,
    paddingVertical: 20,
    borderRadius: 30,
    backgroundColor: '#8A6D1B',
    elevation: 6,
  },
  payBtnPressed: {
    opacity: 0.85,
    backgroundColor: '#755C17',
  },
  payBtnDisabled: {
    backgroundColor: '#B9A768',
  },
  payBtnText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Bottom control bar ─────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(250, 246, 238, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    zIndex: 20,
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
  controlBtnDisabled: {
    opacity: 0.4,
  },
  controlBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 3,
  },
  footerLogo: {
    opacity: 0.85,
  },
});
