import React, { createContext, useEffect, useReducer, type PropsWithChildren } from 'react';

import { getItem, setItem } from '@/utils/storage';

interface FavoritesState {
  favoriteIds: string[];
}

type FavoritesAction =
  | { type: 'TOGGLE'; venueId: string }
  | { type: 'LOAD'; ids: string[] };

interface FavoritesContextValue extends FavoritesState {
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
});

function reducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.favoriteIds.includes(action.venueId);
      return {
        ...state,
        favoriteIds: exists
          ? state.favoriteIds.filter((id) => id !== action.venueId)
          : [...state.favoriteIds, action.venueId],
      };
    }
    case 'LOAD':
      return { ...state, favoriteIds: action.ids };
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { favoriteIds: [] });

  useEffect(() => {
    async function init() {
      const ids = await getItem<string[]>('@spotly/favorites');
      if (ids) {
        dispatch({ type: 'LOAD', ids });
      }
    }
    init();
  }, []);

  const toggleFavorite = async (venueId: string) => {
    const exists = state.favoriteIds.includes(venueId);
    const updated = exists
      ? state.favoriteIds.filter((id) => id !== venueId)
      : [...state.favoriteIds, venueId];
    dispatch({ type: 'TOGGLE', venueId });
    await setItem('@spotly/favorites', updated);
  };

  const isFavorite = (venueId: string) => state.favoriteIds.includes(venueId);

  return (
    <FavoritesContext.Provider value={{ ...state, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
