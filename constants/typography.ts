import { TextStyle } from 'react-native';

// Font families
export const FontFamily = {
  // Display / headings
  displayRegular: 'Oswald-Regular',
  displayMedium: 'Oswald-Medium',
  displaySemiBold: 'Oswald-SemiBold',
  displayBold: 'Oswald-Bold',
  // Body text
  sansRegular: 'Geist-Regular',
  sansMedium: 'Geist-Medium',
  sansSemiBold: 'Geist-SemiBold',
  sansBold: 'Geist-Bold',
  // Monospace (data, numbers, prices)
  monoRegular: 'JetBrainsMono-Regular',
  monoMedium: 'JetBrainsMono-Medium',
  monoSemiBold: 'JetBrainsMono-SemiBold',
  monoBold: 'JetBrainsMono-Bold',
} as const;

export const Typography: Record<string, TextStyle> = {
  // Display headings (Oswald)
  h1: {
    fontFamily: FontFamily.displayBold,
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  h3: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  // Body text (Geist)
  body: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  // Buttons (Geist SemiBold)
  button: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonSm: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  // Mono (JetBrains Mono — for prices, ratings, data)
  mono: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  monoSm: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  // Branding
  brand: {
    fontFamily: FontFamily.displayBold,
    fontSize: 24,
    lineHeight: 30,
  },
} as const;
