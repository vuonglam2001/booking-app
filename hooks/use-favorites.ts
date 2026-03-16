import { useContext } from 'react';

import { FavoritesContext } from '@/contexts/favorites-context';

export function useFavorites() {
  return useContext(FavoritesContext);
}
