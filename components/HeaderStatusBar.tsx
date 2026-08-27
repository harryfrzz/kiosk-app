import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderStatusBarProps {
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

export default function HeaderStatusBar({ isOffline = false }: HeaderStatusBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isLargeScreen = width > 768;
  const timeFontSize = isLargeScreen ? 24 : 18;
  const dateFontSize = isLargeScreen ? 15 : 12;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.leftSection}>
        <LiveClock timeFontSize={timeFontSize} dateFontSize={dateFontSize} />
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
  dateTimeContainer: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '800',
    color: '#8A6D1B',
    letterSpacing: 1,
  },
  dateText: {
    fontFamily: 'Outfit_400Regular',
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
