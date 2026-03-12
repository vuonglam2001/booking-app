import { Platform } from 'react-native';

import type { AppMode } from '@/types';

export type ThemeColorKeys = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  icon: string;
  border: string;
  borderFocused: string;
  inputBackground: string;
  inputPlaceholder: string;
  success: string;
  warning: string;
  error: string;
  overlay: string;
  cardShadow: string;
};

export const ThemeColors: Record<AppMode, ThemeColorKeys> = {
  dining: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textTertiary: '#9B9B9B',
    primary: '#D4613E',
    primaryForeground: '#FFFFFF',
    secondary: '#2D6A4F',
    secondaryForeground: '#FFFFFF',
    tint: '#D4613E',
    tabIconDefault: '#9B9B9B',
    tabIconSelected: '#D4613E',
    icon: '#6B6B6B',
    border: '#E8E8E5',
    borderFocused: '#D4613E',
    inputBackground: '#F2F2EF',
    inputPlaceholder: '#9B9B9B',
    success: '#2D6A4F',
    warning: '#E09F3E',
    error: '#D64045',
    overlay: 'rgba(0,0,0,0.5)',
    cardShadow: 'rgba(0,0,0,0.08)',
  },
  nightlife: {
    background: '#0A0A12',
    surface: '#13131F',
    surfaceElevated: '#1C1C2E',
    text: '#F0F0F5',
    textSecondary: '#A0A0B8',
    textTertiary: '#6B6B80',
    primary: '#A855F7',
    primaryForeground: '#FFFFFF',
    secondary: '#EC4899',
    secondaryForeground: '#FFFFFF',
    tint: '#A855F7',
    tabIconDefault: '#6B6B80',
    tabIconSelected: '#A855F7',
    icon: '#A0A0B8',
    border: '#2A2A3C',
    borderFocused: '#A855F7',
    inputBackground: '#1C1C2E',
    inputPlaceholder: '#6B6B80',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#EF4444',
    overlay: 'rgba(0,0,0,0.7)',
    cardShadow: 'rgba(0,0,0,0.3)',
  },
};

// Keep backward compat alias
export const Colors = {
  light: ThemeColors.dining,
  dark: ThemeColors.nightlife,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
