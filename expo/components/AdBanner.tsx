import React from 'react';
import { Platform } from 'react-native';

const AD_BANNER_HEIGHT = 60;

let AdBannerImpl: React.ComponentType<any> = () => null;

if (Platform.OS !== 'web') {
  AdBannerImpl = require('./AdBanner.native').default;
}

export default React.memo(AdBannerImpl);
export { AD_BANNER_HEIGHT };
