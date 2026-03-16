import React, { createContext, useEffect, useReducer, type PropsWithChildren } from 'react';

import type { AppNotification } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { MOCK_NOTIFICATIONS } from '@/data/mock-notifications';

const STORAGE_KEY = '@spotly/notifications';

interface NotificationsState {
  notifications: AppNotification[];
}

type NotificationsAction =
  | { type: 'LOAD'; notifications: AppNotification[] }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' };

interface NotificationsContextValue extends NotificationsState {
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

function reducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, notifications: action.notifications };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    default:
      return state;
  }
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  useEffect(() => {
    async function init() {
      const stored = await getItem<AppNotification[]>(STORAGE_KEY);
      if (stored && stored.length > 0) {
        dispatch({ type: 'LOAD', notifications: stored });
      } else {
        // Seed with mock data on first launch
        dispatch({ type: 'LOAD', notifications: MOCK_NOTIFICATIONS });
        await setItem(STORAGE_KEY, MOCK_NOTIFICATIONS);
      }
    }
    init();
  }, []);

  const markAsRead = async (id: string) => {
    const updated = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    dispatch({ type: 'MARK_READ', id });
    await setItem(STORAGE_KEY, updated);
  };

  const markAllAsRead = async () => {
    const updated = state.notifications.map((n) => ({ ...n, read: true }));
    dispatch({ type: 'MARK_ALL_READ' });
    await setItem(STORAGE_KEY, updated);
  };

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ ...state, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}
