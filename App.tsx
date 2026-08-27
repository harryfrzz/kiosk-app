import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, PanResponder } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import SpotCouponsPage from './components/SpotCouponsPage';
import FacultyTapIdPage from './components/FacultyTapIdPage';
import FacultyMealsPage from './components/FacultyMealsPage';
import PrintCouponPage from './components/PrintCouponPage';
import HeaderStatusBar from './components/HeaderStatusBar';
import { MOCK_FACULTY_USER, MealDefinition } from './mockData';

type ScreenState = 'splash' | 'landing' | 'spotCoupons' | 'facultyTapId' | 'facultyMeals' | 'printCoupon';

const IDLE_TIMEOUT_SECONDS = 60;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [secondsRemaining, setSecondsRemaining] = useState(IDLE_TIMEOUT_SECONDS);
  const [isOffline, setIsOffline] = useState(false);

  // Active payment payload for PrintCouponPage
  const [activePayment, setActivePayment] = useState<{ meal: MealDefinition; price: number } | null>(null);

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
    setActivePayment(null);
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

  const handleProceedToPayment = (meal: MealDefinition, price: number) => {
    setActivePayment({ meal, price });
    setCurrentScreen('printCoupon');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'spotCoupons':
        return (
          <SpotCouponsPage
            onBack={() => setCurrentScreen('landing')}
            onReset={resetToSplash}
            isOffline={isOffline}
          />
        );
      case 'facultyTapId':
        return (
          <FacultyTapIdPage
            onBack={() => setCurrentScreen('landing')}
            onReset={resetToSplash}
            onCardTapped={() => setCurrentScreen('facultyMeals')}
          />
        );
      case 'facultyMeals':
        return (
          <FacultyMealsPage
            user={MOCK_FACULTY_USER}
            onBack={() => setCurrentScreen('facultyTapId')}
            onReset={resetToSplash}
            onProceedToPayment={handleProceedToPayment}
          />
        );
      case 'printCoupon':
        return activePayment ? (
          <PrintCouponPage
            user={MOCK_FACULTY_USER}
            meal={activePayment.meal}
            price={activePayment.price}
            onFinish={resetToSplash}
          />
        ) : null;
      default:
        return (
          <LandingPage
            onReset={resetToSplash}
            onSpotCoupons={() => setCurrentScreen('spotCoupons')}
            onFacultyCoupons={() => setCurrentScreen('facultyTapId')}
            isOffline={isOffline}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Always mounted so it doesn't reflow LandingPage when the splash clears.
            The splash is an absolute, full-screen overlay that covers it meanwhile. */}
        <HeaderStatusBar isOffline={isOffline} />
        {renderScreen()}
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
