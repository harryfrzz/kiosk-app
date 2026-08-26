import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import AnimatedSplashScreen from './components/AnimatedSplashScreen';

export default function App() {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <View style={styles.container}>
      {/* Main App Content */}
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />

      {/* Splash Screen overlay */}
      {!splashFinished && (
        <AnimatedSplashScreen onAnimationComplete={() => setSplashFinished(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
