import React, { ReactElement } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/spacing';

interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
}

export function Carousel<T>({ data, renderItem, keyExtractor }: CarouselProps<T>) {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
