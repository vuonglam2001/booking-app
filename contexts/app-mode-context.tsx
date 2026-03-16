import React, { createContext, useEffect, useReducer, type PropsWithChildren } from 'react';

import type { AppMode } from '@/types';
import { getItem, setItem } from '@/utils/storage';

interface AppModeState {
  mode: AppMode;
  isInitialized: boolean;
  hasOnboarded: boolean;
}

type AppModeAction =
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'INITIALIZE'; mode: AppMode; hasOnboarded: boolean };

interface AppModeContextValue extends AppModeState {
  setMode: (mode: AppMode) => void;
}

export const AppModeContext = createContext<AppModeContextValue>({
  mode: 'dining',
  isInitialized: false,
  hasOnboarded: false,
  setMode: () => {},
});

function reducer(state: AppModeState, action: AppModeAction): AppModeState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode, hasOnboarded: true };
    case 'INITIALIZE':
      return {
        ...state,
        mode: action.mode,
        hasOnboarded: action.hasOnboarded,
        isInitialized: true,
      };
    default:
      return state;
  }
}

export function AppModeProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, {
    mode: 'dining',
    isInitialized: false,
    hasOnboarded: false,
  });

  useEffect(() => {
    async function init() {
      const mode = await getItem<AppMode>('@spotly/appMode');
      const hasOnboarded = await getItem<boolean>('@spotly/hasOnboarded');
      dispatch({
        type: 'INITIALIZE',
        mode: mode ?? 'dining',
        hasOnboarded: hasOnboarded ?? false,
      });
    }
    init();
  }, []);

  const setMode = async (mode: AppMode) => {
    dispatch({ type: 'SET_MODE', mode });
    await setItem('@spotly/appMode', mode);
    await setItem('@spotly/hasOnboarded', true);
  };

  return (
    <AppModeContext.Provider value={{ ...state, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}
