import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderStatusBarProps {
  secondsRemaining?: number;
  isOffline?: boolean;
}

export default function HeaderStatusBar({ secondsRemaining = 60, isOffline = false }: HeaderStatusBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.leftSection}>
        {/* Active Countdown Timer Badge */}
        <View style={styles.timerBadge}>
          <Ionicons name="timer-outline" size={18} color="#8A6D1B" />
          <Text style={styles.timerText}>{secondsRemaining}s</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {isOffline ? (
          <Ionicons name="cloud-offline-outline" size={24} color="#D32F2F" />
        ) : (
          <Ionicons name="wifi-outline" size={24} color="#388E3C" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 50,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#8A6D1B',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
