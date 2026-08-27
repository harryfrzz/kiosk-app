import React from 'react';
import { View, StyleSheet, Text, Image, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import MandalaArt from './MandalaArt';
import KioskCard from './KioskCard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LandingPageProps {
  onReset: () => void;
  onSpotCoupons: () => void;
  isOffline?: boolean;
}

export default function LandingPage({ onReset, onSpotCoupons, isOffline = false }: LandingPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Dynamic font & logo scaling
  const isLargeScreen = width > 768;
  const subtitleFontSize = isLargeScreen ? 22 : 18;

  // Fluid logo scaling based on viewport size (min 240px on phones, up to 520px on iPad Pro / 4K Kiosks)
  const logoWidth = Math.min(Math.max(width * 0.4, 240), 520);
  const logoHeight = logoWidth * 0.31;

  return (
    <View style={styles.container}>
      <View style={[styles.mandalaContainer, { left: width / 2 - 400, top: height / 2 - 400 }]}>
        <MandalaArt size={800} xml={null} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(20, insets.bottom) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={require('../assets/branding/annakshetra.png')}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
            <Text style={[styles.headerSubtitle, { fontSize: subtitleFontSize }]}>Select a service</Text>
          </View>

          {/* Cards Section */}
          <View style={styles.cardsGrid}>
            <View style={styles.gridRow}>
              <KioskCard
                title="Spot Coupons"
                description={isOffline ? "Currently unavailable offline." : "Instant food coupon generation."}
                onPress={onSpotCoupons}
                style={styles.gridCard}
                contentStyle={isLargeScreen ? styles.heroCardContentLarge : styles.heroCardContent}
              />
            </View>

            <View style={styles.gridRow}>
              <KioskCard
                title="Account Recharge"
                description={isOffline ? "Currently unavailable offline." : "Top-up smart balance using UPI."}
                onPress={() => { console.log('Account Recharge pressed') }}
                disabled={isOffline}
                style={styles.gridCard}
                contentStyle={isLargeScreen ? styles.gridCardContentLarge : styles.gridCardContent}
              />

              <KioskCard
                title="Faculty or Staff Coupon"
                description={isOffline ? "Currently unavailable offline." : "Faculty discount & staff meal pass."}
                onPress={() => { console.log('Faculty Staff Coupon pressed') }}
                style={styles.gridCard}
                contentStyle={isLargeScreen ? styles.gridCardContentLarge : styles.gridCardContent}
              />
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <Pressable onPress={onReset} style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}>
              <Ionicons name="refresh" size={20} color="#8A6D1B" />
              <Text style={styles.resetText}>Start Over</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EE',
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mandalaContainer: {
    position: 'absolute',
    opacity: 0.15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  logo: {
    marginTop: 0,
    marginBottom: 24,
  },
  headerSubtitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  cardsGrid: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 8,
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  // Cancels KioskCard's carousel-era 270px cap so cards fill their grid cell
  gridCard: {
    maxWidth: '100%',
  },
  heroCardContent: {
    minHeight: 200,
    paddingVertical: 24,
  },
  heroCardContentLarge: {
    minHeight: 260,
    paddingVertical: 32,
  },
  gridCardContent: {
    minHeight: 260,
    paddingVertical: 28,
  },
  gridCardContentLarge: {
    minHeight: 320,
    paddingVertical: 36,
  },
  bottomSection: {
    marginTop: 'auto',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 10,
    width: '100%',
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  resetButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  resetText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
});
