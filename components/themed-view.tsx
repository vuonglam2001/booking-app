import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  diningColor?: string;
  nightlifeColor?: string;
};

export function ThemedView({ style, diningColor, nightlifeColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ dining: diningColor, nightlife: nightlifeColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
