import React, { createContext, useEffect, useReducer, type PropsWithChildren } from 'react';

import type { Reservation } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { MOCK_COMPLETED_BOOKINGS } from '@/data/mock-bookings';

interface BookingsState {
  reservations: Reservation[];
}

type BookingsAction =
  | { type: 'ADD_RESERVATION'; reservation: Reservation }
  | { type: 'CANCEL_RESERVATION'; id: string }
  | { type: 'LOAD_RESERVATIONS'; reservations: Reservation[] };

interface BookingsContextValue extends BookingsState {
  addReservation: (reservation: Reservation) => void;
  cancelReservation: (id: string) => void;
}

export const BookingsContext = createContext<BookingsContextValue>({
  reservations: [],
  addReservation: () => {},
  cancelReservation: () => {},
});

function reducer(state: BookingsState, action: BookingsAction): BookingsState {
  switch (action.type) {
    case 'ADD_RESERVATION':
      return { ...state, reservations: [action.reservation, ...state.reservations] };
    case 'CANCEL_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.id ? { ...r, status: 'cancelled' as const } : r
        ),
      };
    case 'LOAD_RESERVATIONS':
      return { ...state, reservations: action.reservations };
    default:
      return state;
  }
}

export function BookingsProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { reservations: [] });

  useEffect(() => {
    async function init() {
      const reservations = await getItem<Reservation[]>('@spotly/reservations');
      if (reservations) {
        // Merge mock completed bookings if not already present
        const mockIds = MOCK_COMPLETED_BOOKINGS.map((b) => b.id);
        const hasMocks = mockIds.every((id) => reservations.some((r) => r.id === id));
        if (hasMocks) {
          dispatch({ type: 'LOAD_RESERVATIONS', reservations });
        } else {
          const missing = MOCK_COMPLETED_BOOKINGS.filter(
            (b) => !reservations.some((r) => r.id === b.id),
          );
          const merged = [...reservations, ...missing];
          dispatch({ type: 'LOAD_RESERVATIONS', reservations: merged });
          await setItem('@spotly/reservations', merged);
        }
      } else {
        // First launch — seed with mock completed bookings
        dispatch({ type: 'LOAD_RESERVATIONS', reservations: MOCK_COMPLETED_BOOKINGS });
        await setItem('@spotly/reservations', MOCK_COMPLETED_BOOKINGS);
      }
    }
    init();
  }, []);

  const addReservation = async (reservation: Reservation) => {
    const updated = [reservation, ...state.reservations];
    dispatch({ type: 'ADD_RESERVATION', reservation });
    await setItem('@spotly/reservations', updated);
  };

  const cancelReservation = async (id: string) => {
    const updated = state.reservations.map((r) =>
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    );
    dispatch({ type: 'CANCEL_RESERVATION', id });
    await setItem('@spotly/reservations', updated);
  };

  return (
    <BookingsContext.Provider value={{ ...state, addReservation, cancelReservation }}>
      {children}
    </BookingsContext.Provider>
  );
}
