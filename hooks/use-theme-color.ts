import { ThemeColors } from '@/constants/theme';
import { useAppMode } from '@/hooks/use-app-mode';

export function useThemeColor(
  props: { dining?: string; nightlife?: string },
  colorName: keyof typeof ThemeColors.dining
) {
  const { mode } = useAppMode();
  const colorFromProps = props[mode];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return ThemeColors[mode][colorName];
  }
}
