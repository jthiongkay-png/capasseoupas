import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111'
  : 'ca-app-pub-6551125672569348/7836940258';

const AD_BANNER_HEIGHT = 60;

let BannerAdComponent: any = null;
let BannerAdSize: any = null;

if (Platform.OS !== 'web') {
  try {
    const MobileAds = require('react-native-google-mobile-ads');
    BannerAdComponent = MobileAds.BannerAd;
    BannerAdSize = MobileAds.BannerAdSize;
  } catch (e) {
    console.log('[AdBanner] react-native-google-mobile-ads not available:', e);
  }
}

interface AdBannerProps {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: () => void;
}

function AdBanner({ onAdLoaded, onAdFailedToLoad }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' && BannerAdComponent) {
      try {
        const MobileAds = require('react-native-google-mobile-ads');
        const mobileAdsInstance = MobileAds.default();
        mobileAdsInstance.initialize().then(() => {
          console.log('[AdBanner] Mobile Ads SDK initialized');
        }).catch((err: any) => {
          console.log('[AdBanner] SDK init error:', err);
        });
      } catch (e) {
        console.log('[AdBanner] Could not initialize SDK:', e);
      }
    }
  }, []);

  if (Platform.OS === 'web' || !BannerAdComponent || !BannerAdSize) {
    return null;
  }

  if (adFailed) {
    return null;
  }

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAdComponent
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

export default React.memo(AdBanner);

export { AD_BANNER_HEIGHT };

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
