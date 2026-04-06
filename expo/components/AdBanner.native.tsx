import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import mobileAds from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111'
  : 'ca-app-pub-6551125672569348/7836940258';

interface AdBannerProps {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: () => void;
}

function AdBanner({ onAdLoaded, onAdFailedToLoad }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('[AdBanner] Mobile Ads SDK initialized');
      })
      .catch((err: any) => {
        console.log('[AdBanner] SDK init error:', err);
      });
  }, []);

  if (adFailed) {
    return null;
  }

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded successfully');
          setAdLoaded(true);
          onAdLoaded?.();
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[AdBanner] Ad failed to load:', error);
          setAdFailed(true);
          onAdFailedToLoad?.();
        }}
      />
    </View>
  );
}

export default AdBanner;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  hidden: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
  },
});
