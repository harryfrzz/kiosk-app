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
import { FacultyUser } from '../mockData';

interface RechargeAmountPageProps {
  user: FacultyUser;
  onBack: () => void;
  onReset: () => void;
  onProceedToRecharge: (amount: number) => void;
}

const RECHARGE_AMOUNTS = [100, 250, 500, 1000];

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

export default function RechargeAmountPage({
  user,
  onBack,
  onReset,
  onProceedToRecharge,
}: RechargeAmountPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleProceed = () => {
    if (selectedAmount !== null) {
      onProceedToRecharge(selectedAmount);
    }
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

        <Text style={styles.headerTitle}>Account Recharge</Text>

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

          <View style={styles.userCard}>
            <BlurView intensity={55} tint="light" style={styles.userCardBlur}>
              <View style={styles.userCardInner}>
                {/* Left: Avatar + Details */}
                <View style={styles.userCardLeft}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={56} color="#D4AF37" />
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userDesignation}>{user.designation}</Text>
                    <Text style={styles.userDepartment}>{user.department}</Text>

                    <View style={styles.userMetaRow}>
                      <View style={[
                        styles.tierBadge,
                        {
                          backgroundColor: `${TIER_COLOR[user.subsidyTier]}18`,
                          borderColor: `${TIER_COLOR[user.subsidyTier]}40`,
                        },
                      ]}>
                        <Text style={[styles.tierText, { color: TIER_COLOR[user.subsidyTier] }]}>
                          {TIER_LABEL[user.subsidyTier]}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right: Balance */}
                <View style={styles.balanceBlock}>
                  <Text style={styles.balanceLabel}>BALANCE</Text>
                  <Text style={styles.balanceAmount}>₹{user.balance.toFixed(2)}</Text>
                </View>
              </View>

              {/* Mandala art */}
              <View style={[styles.userCardMandala, { pointerEvents: 'none' }]}>
                <MandalaArt size={380} animated={false} />
              </View>
            </BlurView>
          </View>
        </View>

        {/* Recharge Amount Section */}
        <View style={styles.sectionHeaderWrapper}>
          <Text style={styles.sectionTitle}>Select Recharge Amount</Text>

          {/* Recharge Amount Cards Grid */}
          <View style={styles.amountGrid}>
            <View style={styles.amountGridRow}>
              {RECHARGE_AMOUNTS.slice(0, 2).map((amount) => {
                const isSelected = selectedAmount === amount;
                return (
                  <Pressable
                    key={amount}
                    onPress={() => setSelectedAmount(amount)}
                    style={({ pressed }) => [
                      styles.amountCard,
                      isSelected && styles.amountCardSelected,
                      pressed && styles.amountCardPressed,
                    ]}
                  >
                    <BlurView
                      intensity={45}
                      tint="light"
                      style={[styles.amountCardBlur, isSelected && styles.amountCardBlurSelected]}
                    >
                      {/* Top Right: Selected indicator */}
                      <View style={styles.amountCardTopRow}>
                        <View style={[styles.rechargeIconBox, isSelected && styles.rechargeIconBoxSelected]}>
                          <Ionicons
                            name="wallet-outline"
                            size={26}
                            color={isSelected ? '#8A6D1B' : '#D4AF37'}
                          />
                        </View>
                        <View style={[
                          styles.statusBadge,
                          isSelected
                            ? { backgroundColor: 'rgba(138,109,27,0.15)', borderColor: 'rgba(138,109,27,0.4)' }
                            : { backgroundColor: 'rgba(46,125,50,0.12)', borderColor: 'rgba(46,125,50,0.35)' },
                        ]}>
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={15}
                            color={isSelected ? '#8A6D1B' : '#2E7D32'}
                          />
                          <Text style={[styles.statusBadgeText, { color: isSelected ? '#8A6D1B' : '#2E7D32' }]}>
                            {isSelected ? 'Selected' : 'Available'}
                          </Text>
                        </View>
                      </View>

                      {/* Center: Amount display */}
                      <View style={styles.amountCenter}>
                        <Text style={styles.rupeeSym}>₹</Text>
                        <Text style={[styles.amountValue, isSelected && styles.amountValueSelected]}>
                          {amount}
                        </Text>
                      </View>

                      {/* Bottom: Arrow/check */}
                      <View style={styles.amountCardBottomRow}>
                        <Text style={styles.addToBalanceText}>Add to balance</Text>
                        <View style={[styles.chevronCircle, isSelected && styles.chevronCircleSelected]}>
                          <Ionicons
                            name={isSelected ? 'checkmark' : 'chevron-forward'}
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#D4AF37'}
                          />
                        </View>
                      </View>
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.amountGridRow}>
              {RECHARGE_AMOUNTS.slice(2, 4).map((amount) => {
                const isSelected = selectedAmount === amount;
                return (
                  <Pressable
                    key={amount}
                    onPress={() => setSelectedAmount(amount)}
                    style={({ pressed }) => [
                      styles.amountCard,
                      isSelected && styles.amountCardSelected,
                      pressed && styles.amountCardPressed,
                    ]}
                  >
                    <BlurView
                      intensity={45}
                      tint="light"
                      style={[styles.amountCardBlur, isSelected && styles.amountCardBlurSelected]}
                    >
                      <View style={styles.amountCardTopRow}>
                        <View style={[styles.rechargeIconBox, isSelected && styles.rechargeIconBoxSelected]}>
                          <Ionicons
                            name="wallet-outline"
                            size={26}
                            color={isSelected ? '#8A6D1B' : '#D4AF37'}
                          />
                        </View>
                        <View style={[
                          styles.statusBadge,
                          isSelected
                            ? { backgroundColor: 'rgba(138,109,27,0.15)', borderColor: 'rgba(138,109,27,0.4)' }
                            : { backgroundColor: 'rgba(46,125,50,0.12)', borderColor: 'rgba(46,125,50,0.35)' },
                        ]}>
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={15}
                            color={isSelected ? '#8A6D1B' : '#2E7D32'}
                          />
                          <Text style={[styles.statusBadgeText, { color: isSelected ? '#8A6D1B' : '#2E7D32' }]}>
                            {isSelected ? 'Selected' : 'Available'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.amountCenter}>
                        <Text style={styles.rupeeSym}>₹</Text>
                        <Text style={[styles.amountValue, isSelected && styles.amountValueSelected]}>
                          {amount}
                        </Text>
                      </View>

                      <View style={styles.amountCardBottomRow}>
                        <Text style={styles.addToBalanceText}>Add to balance</Text>
                        <View style={[styles.chevronCircle, isSelected && styles.chevronCircleSelected]}>
                          <Ionicons
                            name={isSelected ? 'checkmark' : 'chevron-forward'}
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#D4AF37'}
                          />
                        </View>
                      </View>
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomActionBar}>
        <BlurView intensity={75} tint="light" style={styles.actionBarBlur}>
          <View style={styles.actionBarInner}>
            <View style={styles.actionBarInfo}>
              <Text style={styles.actionBarSubtitle}>
                {selectedAmount !== null ? 'RECHARGE AMOUNT' : 'SELECT AN AMOUNT'}
              </Text>
              <View style={styles.actionBarPriceRow}>
                <Text style={styles.actionBarTitle}>
                  {selectedAmount !== null ? `₹${selectedAmount}` : 'None'}
                </Text>
                {selectedAmount !== null && (
                  <Text style={styles.actionBarSub}>Added to wallet</Text>
                )}
              </View>
            </View>

            <Pressable
              onPress={handleProceed}
              disabled={selectedAmount === null}
              style={({ pressed }) => [
                styles.proceedBtn,
                pressed && styles.proceedBtnPressed,
                selectedAmount === null && styles.proceedBtnDisabled,
              ]}
            >
              <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </BlurView>
      </View>

      {/* Pinned Bottom Footer Logo */}
      <View
        style={[styles.pinnedFooter, { paddingBottom: Math.max(10, insets.bottom), pointerEvents: 'none' }]}
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
    paddingBottom: 90,
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

  // ── User card (identical to FacultyMealsPage) ─────────────────────────────
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
    paddingRight: 24,
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
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  tierText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
  },
  balanceBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 10,
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  balanceAmount: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    fontWeight: '800',
    color: '#8A6D1B',
  },

  // ── 2x2 Recharge Amount Grid ───────────────────────────────────────────────
  amountGrid: {
    gap: 16,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  amountGridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  amountCard: {
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
  amountCardSelected: {
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
  amountCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  amountCardBlur: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    minHeight: 200,
  },
  amountCardBlurSelected: {
    backgroundColor: 'rgba(255, 253, 245, 0.96)',
  },
  amountCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  rechargeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeIconBoxSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: 'rgba(212, 175, 55, 0.6)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
  },
  amountCenter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  rupeeSym: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#8A6D1B',
    marginTop: 6,
  },
  amountValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 42,
    fontWeight: '800',
    color: '#2C2C2C',
    lineHeight: 48,
  },
  amountValueSelected: {
    color: '#8A6D1B',
  },
  amountCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  addToBalanceText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#888',
  },
  chevronCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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

  // ── Bottom Action Bar ──────────────────────────────────────────────────────
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
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 28px rgba(212, 175, 55, 0.25)' }
      : {
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 12,
        }),
  } as any,
  actionBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    gap: 16,
  },
  actionBarInfo: {
    flex: 1,
    gap: 2,
  },
  actionBarSubtitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#888',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  actionBarPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  actionBarTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    fontWeight: '800',
    color: '#8A6D1B',
  },
  actionBarSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#888',
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8A6D1B',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 6px 18px rgba(138, 109, 27, 0.35)' }
      : {
          shadowColor: '#8A6D1B',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
        }),
  } as any,
  proceedBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  proceedBtnDisabled: {
    opacity: 0.38,
  },
  proceedBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Pinned Footer ──────────────────────────────────────────────────────────
  pinnedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: 'rgba(250, 246, 238, 0.92)',
    zIndex: 20,
  },
  footerLogo: {
    width: 200,
    height: 62,
    opacity: 0.85,
  },
});
