import React from 'react';
import { View, StyleSheet, Text, Image, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import MandalaArt from './MandalaArt';
import KioskCard from './KioskCard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LandingPageProps {
  onReset: () => void;
  isOffline?: boolean;
}

interface LiveClockProps {
  timeFontSize: number;
  dateFontSize: number;
}

// Memoized clock sub-component to isolate 1s re-renders
const LiveClock = React.memo(({ timeFontSize, dateFontSize }: LiveClockProps) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.dateTimeContainer}>
      <Text style={[styles.timeText, { fontSize: timeFontSize }]}>{formatTime(time)}</Text>
      <Text style={[styles.dateText, { fontSize: dateFontSize }]}>{formatDate(time)}</Text>
    </View>
  );
});

export default function LandingPage({ onReset, isOffline = false }: LandingPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Dynamic font & logo scaling
  const isLargeScreen = width > 768;
  const greetingFontSize = isLargeScreen ? 36 : 26;
  const subtitleFontSize = isLargeScreen ? 22 : 18;
  const timeFontSize = isLargeScreen ? 36 : 28;
  const dateFontSize = isLargeScreen ? 20 : 16;

  // Fluid logo scaling based on viewport size (min 280px on phones, up to 620px on iPad Pro / 4K Kiosks)
  const logoWidth = Math.min(Math.max(width * 0.48, 280), 620);
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
            <Text style={[styles.greetingText, { fontSize: greetingFontSize }]}>Welcome to</Text>
            <Image
              source={require('../assets/branding/annakshetra.png')}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
            <Text style={[styles.headerSubtitle, { fontSize: subtitleFontSize }]}>Select a service</Text>
          </View>

          {/* Cards Section */}
          {isLargeScreen ? (
            <View style={styles.cardsContainer}>
              <KioskCard
                title="Spot Coupons"
                description={isOffline ? "Currently unavailable offline." : "Instant food coupon generation."}
                onPress={() => { console.log('Spot Coupons pressed') }}
              />

              <KioskCard
                title="Account Recharge"
                description={isOffline ? "Currently unavailable offline." : "Top-up smart balance using UPI."}
                onPress={() => { console.log('Account Recharge pressed') }}
                disabled={isOffline}
              />

              <KioskCard
                title="Faculty or Staff Coupon"
                description={isOffline ? "Currently unavailable offline." : "Faculty discount & staff meal pass."}
                onPress={() => { console.log('Faculty Staff Coupon pressed') }}
              />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardsScroll}
              style={{ width: '100%' }}
            >
              <View style={styles.mobileCardWrapper}>
                <KioskCard
                  title="Spot Coupons"
                  description={isOffline ? "Currently unavailable offline." : "Instant food coupon generation."}
                  onPress={() => { console.log('Spot Coupons pressed') }}
                />
              </View>

              <View style={styles.mobileCardWrapper}>
                <KioskCard
                  title="Account Recharge"
                  description={isOffline ? "Currently unavailable offline." : "Top-up smart balance using UPI."}
                  onPress={() => { console.log('Account Recharge pressed') }}
                  disabled={isOffline}
                />
              </View>

              <View style={styles.mobileCardWrapper}>
                <KioskCard
                  title="Faculty or Staff Coupon"
                  description={isOffline ? "Currently unavailable offline." : "Faculty discount & staff meal pass."}
                  onPress={() => { console.log('Faculty Staff Coupon pressed') }}
                />
              </View>
            </ScrollView>
          )}

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <Pressable onPress={onReset} style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}>
              <Ionicons name="refresh" size={20} color="#8A6D1B" />
              <Text style={styles.resetText}>Start Over</Text>
            </Pressable>

            {/* Time & Date Display (Isolated 1s ticking sub-component) */}
            <LiveClock timeFontSize={timeFontSize} dateFontSize={dateFontSize} />
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
  greetingText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontWeight: '700',
    color: '#8A6D1B',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  cardsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 16,
    flex: 1,
    maxHeight: 580,
  },
  horizontalCardsScroll: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mobileCardWrapper: {
    width: 260,
    marginHorizontal: 6,
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
  dateTimeContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  timeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 32,
    fontWeight: '800',
    color: '#8A6D1B',
    letterSpacing: 1.5,
  },
  dateText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
    letterSpacing: 0.8,
  },
});
