import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
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

// Only import SvgXml on native — web uses <img> instead
let SvgXml: any = null;
if (Platform.OS !== 'web') {
  SvgXml = require('react-native-svg').SvgXml;
}

interface MandalaArtProps {
  size?: number;
  xml?: string | null;
  animated?: boolean;
}

let globalCachedXml: string | null = null;
let globalCachedUri: string | null = null;

export default function MandalaArt({ size = 300, xml, animated = true }: MandalaArtProps) {
  const [xmlContent, setXmlContent] = useState<string | null>(xml || globalCachedXml);
  const [webUri, setWebUri] = useState<string | null>(globalCachedUri);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (xml) {
      setXmlContent(xml);
      globalCachedXml = xml;
    }
  }, [xml]);

  useEffect(() => {
    if (!animated) {
      rotation.value = 0;
      return;
    }
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 120000, // Very slow, majestic 2-minute rotation
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(rotation);
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    const alreadyLoaded =
      Platform.OS === 'web' ? !!webUri : !!xmlContent;
    if (alreadyLoaded) return;

    async function loadSvg() {
      try {
        const asset = Asset.fromModule(require('../assets/vectors/mandala_gold.svg'));
        await asset.downloadAsync();

        if (Platform.OS === 'web') {
          // On web: just store the URI so we can use a plain <img>
          const uri = asset.uri;
          globalCachedUri = uri;
          setWebUri(uri);
        } else if (asset.localUri) {
          const content = await FileSystem.readAsStringAsync(asset.localUri);
          globalCachedXml = content;
          setXmlContent(content);
        }
      } catch (error) {
        console.warn('Error loading mandala SVG:', error);
      }
    }
    loadSvg();
  }, [xmlContent, webUri]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.svgWrapper, animatedStyle]}>
        {Platform.OS === 'web' ? (
          webUri ? (
            <Image
              source={{ uri: webUri }}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ) : (
            <View style={{ width: size, height: size }} />
          )
        ) : (
          SvgXml && xmlContent ? (
            <SvgXml xml={xmlContent} width={size} height={size} />
          ) : (
            <View style={{ width: size, height: size }} />
          )
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
