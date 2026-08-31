import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, PanResponder, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import SpotCouponsPage from './components/SpotCouponsPage';
import SpotPaymentPage from './components/SpotPaymentPage';
import FacultyTapIdPage from './components/FacultyTapIdPage';
import FacultyMealsPage from './components/FacultyMealsPage';
import PrintCouponPage from './components/PrintCouponPage';
import RechargeAmountPage from './components/RechargeAmountPage';
import HeaderStatusBar from './components/HeaderStatusBar';
import { MOCK_FACULTY_USER, MealDefinition, PassHolder } from './mockData';

type ScreenState =
  | 'splash'
  | 'landing'
  | 'spotCoupons'
  | 'spotPayment'
  | 'facultyTapId'
  | 'facultyMeals'
  | 'printCoupon'
  | 'rechargeTapId'
  | 'rechargeAmount';

/** What PrintCouponPage needs to render a pass, from either the faculty or spot flow. */
interface ActivePass {
  meal: MealDefinition;
  /** Total amount paid, already multiplied by quantity. */
  price: number;
  quantity: number;
  /** Null for anonymous walk-in spot coupons. */
  holder: PassHolder | null;
}

const IDLE_TIMEOUT_SECONDS = 60;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [isOffline, setIsOffline] = useState(false);

  // Active payment payload for PrintCouponPage
  const [activePayment, setActivePayment] = useState<ActivePass | null>(null);

  // Pending spot order, held between meal selection and payment
  const [spotOrder, setSpotOrder] = useState<{ meal: MealDefinition; quantity: number } | null>(null);

  // A ref, not state: the countdown ticks every second but nothing renders it, so
  // keeping it in state re-reconciled the whole screen tree once a second for nothing.
  const secondsRemainingRef = useRef(IDLE_TIMEOUT_SECONDS);

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
    setSpotOrder(null);
    setCurrentScreen('splash');
  };

  const resetIdleTimer = () => {
    secondsRemainingRef.current = IDLE_TIMEOUT_SECONDS;
  };

  useEffect(() => {
    if (currentScreen === 'splash') return;

    secondsRemainingRef.current = IDLE_TIMEOUT_SECONDS;
    const interval = setInterval(() => {
      secondsRemainingRef.current -= 1;
      if (secondsRemainingRef.current <= 0) {
        clearInterval(interval);
        resetToSplash();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleActivity = () => {
      resetIdleTimer();
    };
    window.addEventListener('pointerdown', handleActivity, { capture: true });
    window.addEventListener('keydown', handleActivity, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', handleActivity, { capture: true });
      window.removeEventListener('keydown', handleActivity, { capture: true });
    };
  }, []);

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
    setActivePayment({
      meal,
      price,
      quantity: 1,
      holder: { name: MOCK_FACULTY_USER.name, department: MOCK_FACULTY_USER.department },
    });
    setCurrentScreen('printCoupon');
  };

  const handleSpotMealSelected = (meal: MealDefinition, quantity: number) => {
    setSpotOrder({ meal, quantity });
    setCurrentScreen('spotPayment');
  };

  const handleSpotPaymentComplete = () => {
    if (!spotOrder) return;
    setActivePayment({
      meal: spotOrder.meal,
      price: spotOrder.meal.basePrice * spotOrder.quantity,
      quantity: spotOrder.quantity,
      holder: null,
    });
    setCurrentScreen('printCoupon');
  };

  const handleProceedToRecharge = (amount: number) => {
    // TODO: hook into payment gateway; for now reset to splash after "success"
    resetToSplash();
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'spotCoupons':
        return (
          <SpotCouponsPage
            onBack={() => setCurrentScreen('landing')}
            onReset={resetToSplash}
            onProceedToPayment={handleSpotMealSelected}
            isOffline={isOffline}
          />
        );
      case 'spotPayment':
        return spotOrder ? (
          <SpotPaymentPage
            meal={spotOrder.meal}
            quantity={spotOrder.quantity}
            onBack={() => setCurrentScreen('spotCoupons')}
            onReset={resetToSplash}
            onPaymentComplete={handleSpotPaymentComplete}
            isOffline={isOffline}
          />
        ) : null;
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
            holder={activePayment.holder}
            meal={activePayment.meal}
            price={activePayment.price}
            quantity={activePayment.quantity}
            onFinish={resetToSplash}
          />
        ) : null;
      case 'rechargeTapId':
        return (
          <FacultyTapIdPage
            onBack={() => setCurrentScreen('landing')}
            onReset={resetToSplash}
            onCardTapped={() => setCurrentScreen('rechargeAmount')}
          />
        );
      case 'rechargeAmount':
        return (
          <RechargeAmountPage
            user={MOCK_FACULTY_USER}
            onBack={() => setCurrentScreen('rechargeTapId')}
            onReset={resetToSplash}
            onProceedToRecharge={handleProceedToRecharge}
          />
        );
      default:
        return (
          <LandingPage
            onReset={resetToSplash}
            onSpotCoupons={() => setCurrentScreen('spotCoupons')}
            onFacultyCoupons={() => setCurrentScreen('facultyTapId')}
            onAccountRecharge={() => setCurrentScreen('rechargeTapId')}
            isOffline={isOffline}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container} {...(Platform.OS !== 'web' ? panResponder.panHandlers : {})}>
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
