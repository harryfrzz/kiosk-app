import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MandalaArt from './MandalaArt';
import {
  FacultyUser,
  MealDefinition,
  MEALS,
  effectivePrice,
  isMealAvailable,
} from '../mockData';

interface FacultyMealsPageProps {
  user: FacultyUser;
  onBack: () => void;
  onReset: () => void;
  onProceedToPayment: (meal: MealDefinition, price: number) => void;
}

const TIER_LABEL: Record<string, string> = {
  full: 'Full Payment',
  half: '50% Subsidised',
  free: 'Free',
};

const TIER_COLOR: Record<string, string> = {
  full: '#8A6D1B',
  half: '#2E7D6E',
  free: '#5B4A8A',
};

export default function FacultyMealsPage({ user, onBack, onReset, onProceedToPayment }: FacultyMealsPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width > 768;

  // Track which meals have been purchased this session
  const [sessionPurchased, setSessionPurchased] = useState<string[]>(user.purchasedMealsToday);
  const [balance, setBalance] = useState(user.balance);

  // Selected meal state (for proceed to payment flow)
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const selectedMeal = MEALS.find((m) => m.id === selectedMealId);
  const selectedMealPrice = selectedMeal
    ? effectivePrice(selectedMeal.basePrice, user.subsidyTier)
    : 0;

  const handleMealCardSelect = (mealId: string) => {
    setSelectedMealId((prev) => (prev === mealId ? null : mealId));
  };

  const handleProceedPayment = () => {
    if (!selectedMeal) return;
    const price = selectedMealPrice;
    setSessionPurchased((prev) => [...prev, selectedMeal.id]);
    setBalance((prev) => Math.max(0, prev - price));
    onProceedToPayment(selectedMeal, price);
  };

  const formatPrice = (price: number) =>
    price === 0 ? 'Free' : `₹${price.toFixed(2)}`;

  const formatTime = (h: number, m: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const displayM = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
    return `${displayH}${displayM} ${suffix}`;
  };

  const renderMealCard = (meal: typeof MEALS[0]) => {
    const price = effectivePrice(meal.basePrice, user.subsidyTier);
    const available = isMealAvailable(meal);
    const alreadyPurchased = sessionPurchased.includes(meal.id);
    const lowBalance = balance < price && price > 0;
    const isActive = available && !alreadyPurchased;
    const isSelected = selectedMealId === meal.id;

    let badgeText: string | null = null;
    let badgeColor = '#888';
    if (alreadyPurchased) { badgeText = 'Already Purchased'; badgeColor = '#5B4A8A'; }
    else if (!available) { badgeText = 'Not Available'; badgeColor = '#888'; }
    else if (lowBalance) { badgeText = 'Low Balance'; badgeColor = '#C87A00'; }

    return (
      <Pressable
        key={meal.id}
        onPress={() => isActive ? handleMealCardSelect(meal.id) : undefined}
        style={({ pressed }) => [
          styles.mealCard,
          isSelected && styles.mealCardSelected,
          isActive && pressed && styles.mealCardPressed,
          !isActive && styles.mealCardDisabled,
        ]}
      >
        <BlurView intensity={45} tint="light" style={[styles.mealCardBlur, isSelected && styles.mealCardBlurSelected]}>
          {/* Top row: Icon + Badge */}
          <View style={styles.mealCardTopRow}>
            <View style={[styles.mealIcon, isSelected && styles.mealIconSelected, !isActive && styles.mealIconDisabled]}>
              <Ionicons
                name={
                  meal.id === 'breakfast' ? 'sunny-outline' :
                  meal.id === 'lunch' ? 'restaurant-outline' :
                  meal.id === 'tea' ? 'cafe-outline' : 'moon-outline'
                }
                size={30}
                color={isSelected ? '#8A6D1B' : isActive ? '#D4AF37' : '#AAA'}
              />
            </View>
            {/* Top Right Status Badge with Icon */}
            {alreadyPurchased ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(91, 74, 138, 0.12)', borderColor: 'rgba(91, 74, 138, 0.35)' }]}>
                <Ionicons name="checkmark-done-circle" size={15} color="#5B4A8A" />
                <Text style={[styles.badgeText, { color: '#5B4A8A' }]}>Purchased</Text>
              </View>
            ) : !available ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(198, 40, 40, 0.12)', borderColor: 'rgba(198, 40, 40, 0.35)' }]}>
                <Ionicons name="close-circle" size={15} color="#C62828" />
                <Text style={[styles.badgeText, { color: '#C62828' }]}>Not Available</Text>
              </View>
            ) : lowBalance ? (
              <View style={[styles.badge, { backgroundColor: 'rgba(200, 122, 0, 0.12)', borderColor: 'rgba(200, 122, 0, 0.35)' }]}>
                <Ionicons name="alert-circle" size={15} color="#C87A00" />
                <Text style={[styles.badgeText, { color: '#C87A00' }]}>Low Balance</Text>
              </View>
            ) : (
              <View style={[
                styles.badge,
                isSelected
                  ? { backgroundColor: 'rgba(138, 109, 27, 0.15)', borderColor: 'rgba(138, 109, 27, 0.4)' }
                  : { backgroundColor: 'rgba(46, 125, 50, 0.12)', borderColor: 'rgba(46, 125, 50, 0.35)' }
              ]}>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={15}
                  color={isSelected ? '#8A6D1B' : '#2E7D32'}
                />
                <Text style={[styles.badgeText, { color: isSelected ? '#8A6D1B' : '#2E7D32' }]}>
                  {isSelected ? 'Selected' : 'Available'}
                </Text>
              </View>
            )}
          </View>

          {/* Middle section: Label + Time */}
          <View style={styles.mealCardMiddle}>
            <Text style={[styles.mealLabel, !isActive && styles.mealLabelDisabled]}>
              {meal.label}
            </Text>
            <Text style={styles.mealTime}>
              {formatTime(meal.startHour, meal.startMinute)} – {formatTime(meal.endHour, meal.endMinute)}
            </Text>
          </View>

          {/* Bottom row: Price + Selection Indicator */}
          <View style={styles.mealCardBottomRow}>
            <View style={styles.priceWrapper}>
              <Text style={[styles.mealPrice, !isActive && styles.mealPriceDisabled]}>
                {formatPrice(price)}
              </Text>
              {user.subsidyTier !== 'full' && price !== meal.basePrice && (
                <Text style={styles.mealOriginalPrice}>₹{meal.basePrice}</Text>
              )}
            </View>
            {isActive && (
              <View style={[styles.chevronCircle, isSelected && styles.chevronCircleSelected]}>
                <Ionicons
                  name={isSelected ? 'checkmark' : 'chevron-forward'}
                  size={20}
                  color={isSelected ? '#FFFFFF' : '#D4AF37'}
                />
              </View>
            )}
          </View>
        </BlurView>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background mandala */}
      <View style={[styles.mandalaContainer, { left: width / 2 - 400, top: height / 2 - 400 }]}>
        <MandalaArt size={800} xml={null} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top) }]}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color="#8A6D1B" />
          <Text style={styles.headerBtnText}>Back</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Faculty & Staff Coupon</Text>

        <Pressable
          onPress={onReset}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
          hitSlop={12}
        >
          <Ionicons name="refresh" size={18} color="#8A6D1B" />
          <Text style={styles.headerBtnText}>Start Over</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(190, insets.bottom + 170) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Details Section */}
        <View style={styles.sectionHeaderWrapper}>
          <Text style={styles.sectionTitle}>User Details</Text>

          {/* User & Balance Card */}
          <View style={styles.userCard}>
            <BlurView intensity={55} tint="light" style={styles.userCardBlur}>
              <View style={styles.userCardInner}>
                {/* Left column: avatar + details */}
                <View style={styles.userCardLeft}>
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={56} color="#D4AF37" />
                  </View>

                  {/* Details stacked below avatar */}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userDesignation}>{user.designation}</Text>
                    <Text style={styles.userDepartment}>{user.department}</Text>

                    <View style={styles.userMetaRow}>
                      <View style={[styles.tierBadge, { backgroundColor: `${TIER_COLOR[user.subsidyTier]}18`, borderColor: `${TIER_COLOR[user.subsidyTier]}40` }]}>
                        <Text style={[styles.tierText, { color: TIER_COLOR[user.subsidyTier] }]}>
                          {TIER_LABEL[user.subsidyTier]}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right column: balance */}
                <View style={styles.balanceBlock}>
                  <Text style={styles.balanceLabel}>BALANCE</Text>
                  <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
                </View>
              </View>

              {/* Mandala art — half-visible on right edge (380px size) */}
              <View style={styles.userCardMandala} pointerEvents="none">
                <MandalaArt size={380} animated={false} />
              </View>
            </BlurView>
          </View>
        </View>

        {/* Select Meals Section */}
        <View style={styles.sectionHeaderWrapper}>
          <Text style={styles.sectionTitle}>Select Meals</Text>

          {/* Meal Cards (2x2 Grid Layout) */}
          <View style={styles.mealGrid}>
            <View style={styles.mealGridRow}>
              {MEALS.slice(0, 2).map((meal) => renderMealCard(meal))}
            </View>
            <View style={styles.mealGridRow}>
              {MEALS.slice(2, 4).map((meal) => renderMealCard(meal))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar: Proceed to Payment */}
      <View style={styles.bottomActionBar}>
        <BlurView intensity={75} tint="light" style={styles.actionBarBlur}>
          <View style={styles.actionBarInner}>
            <View style={styles.actionBarInfo}>
              <Text style={styles.actionBarSubtitle}>
                {selectedMeal ? `SELECTED MEAL` : 'CHOOSE A MEAL'}
              </Text>
              <View style={styles.actionBarPriceRow}>
                <Text style={styles.actionBarMealTitle}>
                  {selectedMeal ? selectedMeal.label : 'None'}
                </Text>
                <Text style={styles.actionBarPrice}>
                  {selectedMeal ? formatPrice(selectedMealPrice) : '—'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleProceedPayment}
              disabled={!selectedMeal}
              style={({ pressed }) => [
                styles.proceedBtn,
                pressed && styles.proceedBtnPressed,
                !selectedMeal && styles.proceedBtnDisabled,
              ]}
            >
              <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </BlurView>
      </View>

      {/* Pinned Bottom Footer Logo */}
      <View style={[styles.pinnedFooter, { paddingBottom: Math.max(10, insets.bottom) }]} pointerEvents="none">
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
  mandalaContainer: {
    position: 'absolute',
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(250, 246, 238, 0.92)',
    zIndex: 10,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
  },
  headerBtnPressed: { opacity: 0.6 },
  headerBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#2C2C2C',
    fontWeight: '800',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90, // extra padding so content scrolls above pinned logo
    gap: 24,
  },
  sectionHeaderWrapper: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#8A6D1B',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  // ── User card
  userCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 28px rgba(212, 175, 55, 0.22)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 10,
        }),
  } as any,
  userCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    overflow: 'hidden',
  },
  userCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 24, // moved balance towards the right side
    gap: 16,
    zIndex: 5,
  },
  userCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userCardMandala: {
    position: 'absolute',
    right: -190,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.18,
  },
  avatar: {
    width: 90,
    height: 118,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    gap: 5,
  },
  userName: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    fontWeight: '800',
    color: '#2C2C2C',
    lineHeight: 28,
  },
  userDesignation: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  userDepartment: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#888',
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  userMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  userEmpId: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#8A6D1B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
  },
  balanceBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    minWidth: 90,
    flexShrink: 0,
  },
  balanceAmount: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    fontWeight: '800',
    color: '#2C2C2C',
  },
  balanceLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 10,
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  balanceDivider: {
    width: 36,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
    marginVertical: 2,
  },
  balanceSubtext: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#AAA',
  },
  // ── Meal 2x2 Grid
  mealGrid: {
    gap: 16,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  mealGridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  mealCard: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 6px 20px rgba(212, 175, 55, 0.18)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 6,
        }),
  } as any,
  mealCardSelected: {
    borderColor: '#D4AF37',
    borderWidth: 2.5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 24px rgba(212, 175, 55, 0.35)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 10,
        }),
  },
  mealCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  mealCardDisabled: {
    opacity: 0.55,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  mealCardBlur: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    minHeight: 225,
  },
  mealCardBlurSelected: {
    backgroundColor: 'rgba(255, 253, 245, 0.96)',
  },
  mealCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  mealCardMiddle: {
    gap: 5,
    marginVertical: 10,
  },
  mealCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  chevronCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCircleSelected: {
    backgroundColor: '#8A6D1B',
    borderColor: '#8A6D1B',
  },
  selectedRadioBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealIconSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: 'rgba(212, 175, 55, 0.6)',
  },
  mealIconDisabled: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  mealLabel: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    fontWeight: '800',
    color: '#2C2C2C',
  },
  mealLabelDisabled: {
    color: '#999',
  },
  mealTime: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#777',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
  },
  mealPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    fontWeight: '800',
    color: '#8A6D1B',
  },
  mealPriceDisabled: {
    color: '#AAA',
  },
  mealOriginalPrice: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  // ── Bottom Action Bar (Proceed to Payment)
  bottomActionBar: {
    position: 'absolute',
    bottom: 84,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    paddingHorizontal: 16,
  },
  actionBarBlur: {
    width: '100%',
    maxWidth: 900,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 28px rgba(212, 175, 55, 0.25)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 10,
        }),
  } as any,
  actionBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 22,
    gap: 16,
  },
  actionBarInfo: {
    gap: 2,
  },
  actionBarSubtitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#8A6D1B',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  actionBarPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBarMealTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2C2C2C',
    fontWeight: '800',
  },
  actionBarPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    color: '#8A6D1B',
    fontWeight: '800',
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8A6D1B',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 25,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 14px rgba(138, 109, 27, 0.35)' }
      : {
          shadowColor: '#8A6D1B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }),
  } as any,
  proceedBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  proceedBtnDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  proceedBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pinnedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: 'rgba(250, 246, 238, 0.85)',
    zIndex: 20,
  },
  footerLogo: {
    width: 200,
    height: 62,
    opacity: 0.85,
  },
});
