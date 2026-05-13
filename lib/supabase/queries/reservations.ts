import { createClient } from '@/lib/supabase/server';
import { MOCK_RESERVATIONS } from '@/lib/mock-data';
import { mapReservation } from '@/lib/mappers';
import type { Reservation, ReservationStatus } from '@/types/app';
import type { ReservationRow, ReservationUpdate } from '@/lib/supabase/types';

// ─── Query option types ───────────────────────────────────────────────────────

export interface ListReservationsOptions {
  status?: ReservationStatus;
  serviceId?: string;
  date?: string;          // 'YYYY-MM-DD' — exact match on reservation_date
  dateFrom?: string;      // 'YYYY-MM-DD' — range start (inclusive)
  dateTo?: string;        // 'YYYY-MM-DD' — range end (inclusive)
  limit?: number;         // default 100
  orderBy?: 'created_at' | 'reservation_date';
  ascending?: boolean;
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

/**
 * Fetch a pageable, filterable list of reservations.
 * Returns mapped Reservation[] (camelCase app types).
 * Falls back to mock data when Supabase is not configured.
 */
export async function getReservations(
  opts: ListReservationsOptions = {},
): Promise<Reservation[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_RESERVATIONS;
  }

  const {
    status,
    serviceId,
    date,
    dateFrom,
    dateTo,
    limit = 100,
    orderBy = 'reservation_date',
    ascending = false,
  } = opts;

  const supabase = await createClient();

  let query = supabase
    .from('reservations')
    .select('*')
    .order(orderBy, { ascending })
    .limit(limit);

  if (status)    query = query.eq('status', status);
  if (serviceId) query = query.eq('service_id', serviceId);
  if (date)      query = query.eq('reservation_date', date);
  if (dateFrom)  query = query.gte('reservation_date', dateFrom);
  if (dateTo)    query = query.lte('reservation_date', dateTo);

  const { data, error } = await query;

  if (error) throw new Error(`[getReservations] ${error.message}`);
  return (data as ReservationRow[]).map(mapReservation);
}

/**
 * Fetch a single reservation by its id.
 * Returns null if not found.
 */
export async function getReservationById(id: string): Promise<Reservation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    throw new Error(`[getReservationById] ${error.message}`);
  }

  return mapReservation(data as ReservationRow);
}

/**
 * Fetch all reservations for a given date (useful for availability checks).
 */
export async function getReservationsByDate(date: string): Promise<Reservation[]> {
  return getReservations({ date, limit: 200, orderBy: 'reservation_date', ascending: true });
}

/**
 * Check whether a time slot is available for a service on a given date.
 * Uses overlap logic: a conflict exists when
 *   existing.start_time < new.end_time AND existing.end_time > new.start_time
 * Returns true when no active reservation overlaps the requested window.
 */
export async function isSlotAvailable(
  serviceId: string,
  reservationDate: string,
  startTime: string,   // 'HH:MM:SS'
  endTime: string,     // 'HH:MM:SS'
): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('service_id', serviceId)
    .eq('reservation_date', reservationDate)
    .in('status', ['novo', 'potvrđeno', 'plaćeno'])
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (error) throw new Error(`[isSlotAvailable] ${error.message}`);
  return (count ?? 0) === 0;
}

// ─── Write helpers ────────────────────────────────────────────────────────────

/**
 * Create a new reservation.
 * Returns the mapped Reservation (camelCase) after insert.
 */
export async function createReservation(
  data: import('@/lib/supabase/types').ReservationInsert,
): Promise<Reservation> {
  const supabase = await createClient();

  // Hand-written Database types don't satisfy GenericSchema's index signature
  // for Views/Functions, so the SDK resolves Insert to never[]. Cast through any.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from('reservations') as any;
  const { data: row, error } = await table.insert(data).select().single();

  if (error) throw new Error(`[createReservation] ${error.message}`);
  return mapReservation(row as ReservationRow);
}

/**
 * Update mutable fields on an existing reservation.
 * Requires admin authentication (enforced by RLS).
 */
export async function updateReservation(
  id: string,
  updates: ReservationUpdate,
): Promise<Reservation> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from('reservations') as any;
  const { data, error } = await table.update(updates).eq('id', id).select().single();

  if (error) throw new Error(`[updateReservation] ${error.message}`);
  return mapReservation(data as ReservationRow);
}

/**
 * Convenience wrapper — change only the status of a reservation.
 */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  return updateReservation(id, { status });
}

/**
 * Hard-delete a reservation by id.
 * Requires admin authentication (enforced by RLS).
 */
export async function deleteReservation(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`[deleteReservation] ${error.message}`);
}
