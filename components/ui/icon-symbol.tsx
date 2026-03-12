import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'magnifyingglass': 'search',
  'calendar': 'event',
  'person.fill': 'person',
  'star.fill': 'star',
  'mappin': 'place',
  'clock': 'schedule',
  'person.2.fill': 'group',
  'xmark': 'close',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'arrow.left': 'arrow-back',
  'minus': 'remove',
  'plus': 'add',
  'checkmark.circle.fill': 'check-circle',
  'fork.knife': 'restaurant',
  'music.note': 'nightlife',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
