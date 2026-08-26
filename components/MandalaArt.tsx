import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

interface MandalaArtProps {
  size?: number;
  xml?: string | null;
}

export default function MandalaArt({ size = 300, xml }: MandalaArtProps) {
  const [xmlContent, setXmlContent] = useState<string | null>(xml || null);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (xml) {
      setXmlContent(xml);
    }
  }, [xml]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 120000, // Very slow, majestic 2-minute rotation
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(rotation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    if (xmlContent) return;

    async function loadSvg() {
      try {
        const asset = Asset.fromModule(require('../assets/mandala_gold.svg'));
        await asset.downloadAsync();
        
        if (asset.localUri) {
          const content = await FileSystem.readAsStringAsync(asset.localUri);
          setXmlContent(content);
        }
      } catch (error) {
        console.warn('Error loading mandala SVG:', error);
      }
    }
    loadSvg();
  }, [xmlContent]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.svgWrapper, animatedStyle]}>
        {xmlContent ? (
          <SvgXml xml={xmlContent} width={size} height={size} />
        ) : (
          <View style={{ width: size, height: size }} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
});
