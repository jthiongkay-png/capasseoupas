import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accepted: string;
  acceptedLight: string;
  refused: string;
  refusedLight: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
  tabBar: string;
  tabBarInactive: string;
  warning: string;
  warningLight: string;
  searchBg: string;
  inputBg: string;
}

const LightColors: ThemeColors = {
  primary: '#222222',
  primaryDark: '#000000',
  primaryLight: '#F7F7F7',
  accent: '#1A2B49',
  accepted: '#008A05',
  acceptedLight: '#E8F5E9',
  refused: '#C13515',
  refusedLight: '#FDECEA',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#222222',
  textSecondary: '#717171',
  textTertiary: '#B0B0B0',
  border: '#EBEBEB',
  borderLight: '#F7F7F7',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
  tabBar: '#FFFFFF',
  tabBarInactive: '#B0B0B0',
  warning: '#E8A317',
  warningLight: '#FFF8E7',
  searchBg: '#F7F7F7',
  inputBg: '#FFFFFF',
};

const DarkColors: ThemeColors = {
  primary: '#E8E8E8',
  primaryDark: '#FFFFFF',
  primaryLight: '#1C1C1E',
  accent: '#5B8DEF',
  accepted: '#34C759',
  acceptedLight: '#1A3A1E',
  refused: '#FF453A',
  refusedLight: '#3A1A1A',
  background: '#000000',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  textPrimary: '#F2F2F7',
  textSecondary: '#98989F',
  textTertiary: '#636366',
  border: '#38383A',
  borderLight: '#1C1C1E',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBar: '#1C1C1E',
  tabBarInactive: '#636366',
  warning: '#FFD60A',
  warningLight: '#3A3A1A',
  searchBg: '#1C1C1E',
  inputBg: '#1C1C1E',
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return useMemo(() => (scheme === 'dark' ? DarkColors : LightColors), [scheme]);
}

const Colors = LightColors;
export default Colors;
