import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MandalaArt from './MandalaArt';
import {
  MEALS,
  MealDefinition,
  isMealAvailable,
  formatINR,
  formatMealWindow,
  spotCouponTotal,
  SPOT_MIN_QUANTITY,
  SPOT_MAX_QUANTITY,
} from '../mockData';

interface SpotCouponsPageProps {
  onBack: () => void;
  onReset: () => void;
  onProceedToPayment: (meal: MealDefinition, quantity: number) => void;
  isOffline?: boolean;
}

const MEAL_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  tea: 'cafe-outline',
  dinner: 'moon-outline',
};

export default function SpotCouponsPage({
  onBack,
  onReset,
  onProceedToPayment,
  isOffline = false,
}: SpotCouponsPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLargeScreen = width > 768;

  // Once a meal is picked the quantity step takes over the screen.
  const [selectedMeal, setSelectedMeal] = useState<MealDefinition | null>(null);
  const [quantity, setQuantity] = useState(SPOT_MIN_QUANTITY);

  const openQuantityStep = (meal: MealDefinition) => {
    setSelectedMeal(meal);
    setQuantity(SPOT_MIN_QUANTITY);
  };

  const closeQuantityStep = () => setSelectedMeal(null);

  const decrement = () =>
    setQuantity((q) => Math.max(SPOT_MIN_QUANTITY, q - 1));
  const increment = () =>
    setQuantity((q) => Math.min(SPOT_MAX_QUANTITY, q + 1));

  const total = selectedMeal ? spotCouponTotal(selectedMeal, quantity) : 0;
  const atMin = quantity <= SPOT_MIN_QUANTITY;
  const atMax = quantity >= SPOT_MAX_QUANTITY;

  const renderMealCard = (meal: MealDefinition) => {
    const available = isMealAvailable(meal);
    const selectable = available && !isOffline;

    return (
      <Pressable
        key={meal.id}
        onPress={() => (selectable ? openQuantityStep(meal) : undefined)}
        style={({ pressed }) => [
          styles.mealCard,
          isLargeScreen && styles.mealCardLarge,
          selectable && pressed && styles.mealCardPressed,
          !selectable && styles.mealCardDisabled,
        ]}
      >
        <BlurView intensity={45} tint="light" style={styles.mealCardBlur}>
          <View style={styles.mealCardTopRow}>
            <View style={[styles.mealIcon, !selectable && styles.mealIconDisabled]}>
              <Ionicons
                name={MEAL_ICON[meal.id] ?? 'fast-food-outline'}
                size={30}
                color={selectable ? '#D4AF37' : '#AAA'}
              />
            </View>

            {isOffline ? (
              <View style={[styles.badge, styles.badgeOffline]}>
                <Ionicons name="cloud-offline" size={15} color="#C62828" />
                <Text style={[styles.badgeText, { color: '#C62828' }]}>Offline</Text>
              </View>
            ) : available ? (
              <View style={[styles.badge, styles.badgeAvailable]}>
                <Ionicons name="checkmark-circle-outline" size={15} color="#2E7D32" />
                <Text style={[styles.badgeText, { color: '#2E7D32' }]}>Available</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeClosed]}>
                <Ionicons name="time-outline" size={15} color="#888" />
                <Text style={[styles.badgeText, { color: '#888' }]}>Closed</Text>
              </View>
            )}
          </View>

          <View style={styles.mealCardBody}>
            <Text style={styles.mealTitle}>{meal.label}</Text>
            <Text style={styles.mealWindow}>Served {formatMealWindow(meal)}</Text>
          </View>

          <View style={styles.mealCardBottomRow}>
            <Text style={styles.mealPrice}>{formatINR(meal.basePrice)}</Text>
            <View style={[styles.chevronCircle, !selectable && styles.chevronCircleDisabled]}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={selectable ? '#D4AF37' : '#BBB'}
              />
            </View>
          </View>

          <View style={[styles.mealCardMandala, { pointerEvents: 'none' }]}>
            <MandalaArt size={280} animated={false} />
          </View>
        </BlurView>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mandalaContainer, { left: width / 2 - 400, top: height / 2 - 400 }]}>
        <MandalaArt size={800} />
      </View>

      {/*
        One title block for the whole page: an eyebrow for context and a heading
        that names the current step. The controls live in the bottom bar.
      */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SPOT COUPONS</Text>
        <Text style={styles.headerTitle}>
          {selectedMeal ? 'How many coupons?' : 'Select a Meal'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {selectedMeal
            ? `${selectedMeal.label} · ${formatINR(selectedMeal.basePrice)} each`
            : isOffline
              ? 'Spot coupons are unavailable while offline.'
              : 'Walk-in coupons, no card needed.'}
        </Text>
      </View>

      {selectedMeal ? (
        /* ── Step 2 — how many coupons ─────────────────────────────────────── */
        <View style={styles.quantityStep}>
          <View style={styles.quantityCard}>
            <BlurView intensity={55} tint="light" style={styles.quantityCardBlur}>
              {/* − [ big number ] + */}
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={decrement}
                  disabled={atMin}
                  hitSlop={16}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    pressed && !atMin && styles.stepperBtnPressed,
                    atMin && styles.stepperBtnDisabled,
                  ]}
                >
                  <Ionicons name="remove" size={44} color={atMin ? '#CCC' : '#8A6D1B'} />
                </Pressable>

                <View style={styles.quantityValueBox}>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                </View>

                <Pressable
                  onPress={increment}
                  disabled={atMax}
                  hitSlop={16}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    pressed && !atMax && styles.stepperBtnPressed,
                    atMax && styles.stepperBtnDisabled,
                  ]}
                >
                  <Ionicons name="add" size={44} color={atMax ? '#CCC' : '#8A6D1B'} />
                </Pressable>
              </View>

              <Text style={styles.quantityHint}>
                {atMax ? `Maximum ${SPOT_MAX_QUANTITY} coupons per purchase` : 'Tap + or − to adjust'}
              </Text>

              <View style={styles.totalDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>{formatINR(total)}</Text>
              </View>

              <View style={[styles.quantityCardMandala, { pointerEvents: 'none' }]}>
                <MandalaArt size={360} animated={false} />
              </View>
            </BlurView>
          </View>

          <Pressable
            onPress={() => onProceedToPayment(selectedMeal, quantity)}
            style={({ pressed }) => [styles.continueBtn, pressed && styles.continueBtnPressed]}
          >
            <Text style={styles.continueBtnText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={closeQuantityStep}
            style={({ pressed }) => [styles.changeMealBtn, pressed && styles.controlBtnPressed]}
          >
            <Text style={styles.changeMealText}>Choose a different meal</Text>
          </Pressable>
        </View>
      ) : (
        /* ── Step 1 — pick a meal ──────────────────────────────────────────── */
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(130, insets.bottom + 120) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mealGrid, isLargeScreen && styles.mealGridLarge]}>
            {MEALS.map(renderMealCard)}
          </View>
        </ScrollView>
      )}

      {/* Pinned bottom control bar — Back and Start Over flanking the logo */}
      <View style={[styles.pinnedFooter, { paddingBottom: Math.max(10, insets.bottom) }]}>
        <Pressable
          onPress={selectedMeal ? closeQuantityStep : onBack}
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
            { width: isLargeScreen ? 200 : 130, height: isLargeScreen ? 62 : 40 },
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
    paddingBottom: 16,
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

  // ── Meal selection ─────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  mealGrid: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    gap: 14,
  },
  mealGridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mealCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#FAF6EE',
    elevation: 6,
  },
  mealCardLarge: {
    width: '48%',
  },
  mealCardPressed: {
    opacity: 0.85,
    borderColor: 'rgba(138, 109, 27, 0.6)',
  },
  mealCardDisabled: {
    opacity: 0.5,
  },
  mealCardBlur: {
    padding: 20,
    minHeight: 170,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
  },
  mealCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  mealIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  mealIconDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeAvailable: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    borderColor: 'rgba(46, 125, 50, 0.35)',
  },
  badgeClosed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(198, 40, 40, 0.12)',
    borderColor: 'rgba(198, 40, 40, 0.35)',
  },
  badgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
  },
  mealCardBody: {
    marginTop: 14,
    zIndex: 5,
  },
  mealTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    fontWeight: '800',
    color: '#2C2C2C',
    letterSpacing: 0.2,
  },
  mealWindow: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  mealCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    zIndex: 5,
  },
  mealPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#8A6D1B',
  },
  chevronCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  chevronCircleDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  mealCardMandala: {
    position: 'absolute',
    right: -140,
    bottom: -140,
    opacity: 0.18,
  },

  // ── Quantity step ──────────────────────────────────────────────────────────
  quantityStep: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  quantityCard: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: '#FAF6EE',
    elevation: 8,
  },
  quantityCardBlur: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    overflow: 'hidden',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  stepperBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  stepperBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderColor: 'rgba(138, 109, 27, 0.6)',
  },
  stepperBtnDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  quantityValueBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 96,
    lineHeight: 108,
    fontWeight: '800',
    color: '#2C2C2C',
  },
  quantityHint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 6,
    zIndex: 5,
  },
  totalDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 20,
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
    fontSize: 34,
    fontWeight: '800',
    color: '#8A6D1B',
  },
  quantityCardMandala: {
    position: 'absolute',
    right: -180,
    bottom: -180,
    opacity: 0.15,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 26,
    width: '100%',
    maxWidth: 560,
    paddingVertical: 20,
    borderRadius: 30,
    backgroundColor: '#8A6D1B',
    elevation: 6,
  },
  continueBtnPressed: {
    opacity: 0.85,
    backgroundColor: '#755C17',
  },
  continueBtnText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  changeMealBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  changeMealText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    fontWeight: '700',
    color: '#8A6D1B',
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
