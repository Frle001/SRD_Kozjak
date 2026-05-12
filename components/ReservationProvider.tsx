'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { MOCK_RESERVATIONS } from '@/lib/mock-data';
import type { Reservation, ReservationStatus } from '@/lib/mock-data';

const STORAGE_KEY = 'srd_reservations_v1';

type ReservationCtx = {
  reservations: Reservation[];
  addReservation: (r: Reservation) => void;
  updateStatus: (id: string, status: ReservationStatus) => void;
};

const ReservationContext = createContext<ReservationCtx | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] =
    useState<Reservation[]>(MOCK_RESERVATIONS);

  // On mount: load from localStorage or seed with mocks
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Reservation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReservations(parsed);
          return;
        }
      }
      // First visit — persist the mocks so status changes survive refresh
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_RESERVATIONS));
    } catch {
      // localStorage unavailable (e.g. private mode) — just use in-memory mocks
    }
  }, []);

  // Keep localStorage in sync on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch {}
  }, [reservations]);

  function addReservation(r: Reservation) {
    setReservations((prev) => [r, ...prev]);
  }

  function updateStatus(id: string, status: ReservationStatus) {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return (
    <ReservationContext.Provider
      value={{ reservations, addReservation, updateStatus }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations(): ReservationCtx {
  const ctx = useContext(ReservationContext);
  if (!ctx)
    throw new Error('useReservations must be used within ReservationProvider');
  return ctx;
}
