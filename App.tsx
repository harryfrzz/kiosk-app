import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, PanResponder } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import HeaderStatusBar from './components/HeaderStatusBar';

type ScreenState = 'splash' | 'landing';

const IDLE_TIMEOUT_SECONDS = 60;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [secondsRemaining, setSecondsRemaining] = useState(IDLE_TIMEOUT_SECONDS);
  const [isOffline, setIsOffline] = useState(false);

  // Centralized Network Status Polling
  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOffline(!networkState.isConnected);
    };

    checkNetwork();
    const networkTimer = setInterval(checkNetwork, 5000);
    return () => clearInterval(networkTimer);
  }, []);

  const resetToSplash = () => {
    setCurrentScreen('splash');
  };

  // Guarded to prevent state spam on touch drag/scroll
  const resetIdleTimer = () => {
    setSecondsRemaining((prev) => (prev === IDLE_TIMEOUT_SECONDS ? prev : IDLE_TIMEOUT_SECONDS));
  };

  useEffect(() => {
    if (currentScreen === 'splash') return;

    setSecondsRemaining(IDLE_TIMEOUT_SECONDS);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetToSplash();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetIdleTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetIdleTimer();
        return false;
      },
    })
  ).current;

  return (
    <SafeAreaProvider>
      <View style={styles.container} {...panResponder.panHandlers}>
        {currentScreen !== 'splash' && (
          <HeaderStatusBar secondsRemaining={secondsRemaining} isOffline={isOffline} />
        )}
        <LandingPage onReset={resetToSplash} isOffline={isOffline} />
        <StatusBar style="auto" />

        {currentScreen === 'splash' && (
          <SplashScreen onAnimationComplete={() => setCurrentScreen('landing')} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EE',
  },
});
