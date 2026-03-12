import React, { createContext, useEffect, useReducer, type PropsWithChildren } from 'react';

import type { User } from '@/types';
import { getItem, removeItem, setItem } from '@/utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean };

interface AuthContextValue extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.user, isLoading: false };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, {
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    async function init() {
      const user = await getItem<User>('@spotly/user');
      if (user) {
        dispatch({ type: 'LOGIN', user });
      } else {
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    }
    init();
  }, []);

  const login = async (user: User) => {
    dispatch({ type: 'LOGIN', user });
    await setItem('@spotly/user', user);
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT' });
    await removeItem('@spotly/user');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
