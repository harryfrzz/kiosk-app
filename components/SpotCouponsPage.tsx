import React from 'react';
import { View, StyleSheet, Text, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import MandalaArt from './MandalaArt';
import KioskCard from './KioskCard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SpotCouponsPageProps {
  onBack: () => void;
  onReset: () => void;
  isOffline?: boolean;
}

interface Meal {
  title: string;
  description: string;
}

const MEALS: Meal[] = [
  { title: 'Breakfast', description: 'Served 7:30 AM - 10:00 AM' },
  { title: 'Lunch', description: 'Served 12:00 PM - 2:30 PM' },
  { title: 'Snacks', description: 'Served 4:00 PM - 6:00 PM' },
  { title: 'Dinner', description: 'Served 7:00 PM - 9:30 PM' },
];

export default function SpotCouponsPage({ onBack, onReset, isOffline = false }: SpotCouponsPageProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLargeScreen = width > 768;
  const headingFontSize = isLargeScreen ? 34 : 26;
  const subtitleFontSize = isLargeScreen ? 20 : 16;

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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color="#8A6D1B" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={[styles.heading, { fontSize: headingFontSize }]}>Spot Coupons</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>Select a meal</Text>
          </View>

          {/* Meal Cards (vertical stack) */}
          <View style={styles.mealList}>
            {MEALS.map((meal) => (
              <KioskCard
                key={meal.title}
                layout="row"
                title={meal.title}
                description={isOffline ? 'Currently unavailable offline.' : meal.description}
                onPress={() => { console.log(`${meal.title} pressed`) }}
                disabled={isOffline}
                style={styles.mealCard}
              />
            ))}
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
    paddingTop: 10,
  },
  headerSection: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 12,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 2,
  },
  heading: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontWeight: '800',
    color: '#8A6D1B',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginTop: 4,
  },
  mealList: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 8,
    gap: 14,
  },
  // Cancels KioskCard's 270px cap so each meal row spans the list width
  mealCard: {
    maxWidth: '100%',
  },
  bottomSection: {
    marginTop: 'auto',
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
