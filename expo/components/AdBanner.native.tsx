import React from 'react';
import { View } from 'react-native';

const AD_BANNER_HEIGHT = 60;

interface AdBannerProps {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: () => void;
}

function AdBanner(_props: AdBannerProps) {
  return <View />;
}

export default React.memo(AdBanner);
export { AD_BANNER_HEIGHT };
