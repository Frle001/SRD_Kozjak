'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createReservation, isSlotAvailable } from '@/lib/supabase/queries/reservations';
import { UNAVAILABLE_SLOTS } from '@/lib/mock-data';
import type { ReservationStatus } from '@/types/app';
import type { ReservationRow } from '@/lib/supabase/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Derive a human-friendly display code from a UUID. Never stored in the DB. */
function uuidToDisplayCode(uuid: string): string {
  return 'KOZ-' + uuid.slice(0, 5).toUpperCase();
}

/** 'HH:MM' + duration in minutes → 'HH:MM:SS' end time string. */
function computeEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export type SubmitReservationResult =
  | { success: true; bookingRef: string }
  | { success: false; error: string };

// ─── Availability ─────────────────────────────────────────────────────────────

/**
 * Return the list of taken start times ('HH:MM') for a given service and date.
 * Falls back to mock data when Supabase is not configured.
 */
export async function getAvailabilityAction(
  serviceId: string,
  date: string,
): Promise<{ takenSlots: string[] }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { takenSlots: UNAVAILABLE_SLOTS[date] ?? [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('start_time')
      .eq('service_id', serviceId)
      .eq('reservation_date', date)
      .in('status', ['novo', 'potvrđeno', 'plaćeno']);

    if (error) {
      console.error('[getAvailabilityAction]', error.message);
      return { takenSlots: [] };
    }

    const takenSlots = (data as Pick<ReservationRow, 'start_time'>[])
      .map((r) => r.start_time.slice(0, 5)); // 'HH:MM:SS' → 'HH:MM'

    return { takenSlots };
  } catch (err) {
    console.error('[getAvailabilityAction]', err);
    return { takenSlots: [] };
  }
}

// ─── Submit ───────────────────────────────────────────────────────────────────

/**
 * Validate input, check availability with overlap logic, persist the reservation,
 * and return the booking reference. No authentication required — anonymous inserts
 * are allowed by the `reservations_anon_insert` RLS policy.
 */
export async function submitReservationAction(
  serviceId: string,
  date: string,
  time: string,            // 'HH:MM'
  durationMinutes: number,
  customerName: string,
  customerPhone: string,
  note: string,
): Promise<SubmitReservationResult> {
  // ── Field validation ──────────────────────────────────────────────────────
  const name  = customerName.trim();
  const phone = customerPhone.trim();

  if (!serviceId || !date || !time) {
    return { success: false, error: 'Nedostaju podaci o terminu.' };
  }
  if (!name) {
    return { success: false, error: 'Ime i prezime su obavezni.' };
  }
  if (!phone) {
    return { success: false, error: 'Broj mobitela je obavezan.' };
  }

  const startTimeFull = `${time}:00`;
  const endTimeFull   = computeEndTime(time, durationMinutes);

  // ── Availability guard (server-side, defense-in-depth) ────────────────────
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const available = await isSlotAvailable(serviceId, date, startTimeFull, endTimeFull);
      if (!available) {
        return {
          success: false,
          error: 'Odabrani termin je već zauzet. Molimo odaberite drugi termin.',
        };
      }
    } catch {
      // If the availability check itself fails, proceed optimistically and let
      // the insert surface a conflict if one exists.
    }
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Dev/demo mode — no Supabase; derive a display code from a random UUID.
    return { success: true, bookingRef: uuidToDisplayCode(crypto.randomUUID()) };
  }

  try {
    const reservation = await createReservation({
      service_id:       serviceId,
      reservation_date: date,
      start_time:       startTimeFull,
      end_time:         endTimeFull,
      customer_name:    name,
      customer_phone:   phone,
      note:             note.trim(),
      status:           'novo',
    });
    // Derive the human-friendly code from the UUID Postgres generated.
    return { success: true, bookingRef: uuidToDisplayCode(reservation.id) };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (
      message.includes('duplicate') ||
      message.includes('unique') ||
      message.includes('idx_reservations')
    ) {
      return {
        success: false,
        error: 'Odabrani termin je već zauzet. Molimo odaberite drugi termin.',
      };
    }
    console.error('[submitReservationAction]', err);
    return {
      success: false,
      error: 'Rezervacija nije mogla biti pohranjena. Pokušajte ponovo.',
    };
  }
}

// ─── Admin status update ──────────────────────────────────────────────────────

/**
 * Update the status of a reservation. Uses the service-role client so that
 * the admin panel works without an authenticated session (demo mode).
 */
export async function updateReservationStatusAction(
  id: string,
  status: ReservationStatus,
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Dev/demo mode — no real DB, accept optimistic update.
    return { success: true };
  }

  try {
    const supabase = await createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('reservations') as any;
    const { data, error } = await table
      .update({ status })
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      console.error('[updateReservationStatusAction] Supabase error:', error.message, { id, status });
      return { success: false, error: error.message };
    }

    if (!data) {
      console.error('[updateReservationStatusAction] No row matched id:', id);
      return { success: false, error: 'Reservation not found' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[updateReservationStatusAction] Unexpected error:', err);
    return { success: false, error: String(err) };
  }
}
