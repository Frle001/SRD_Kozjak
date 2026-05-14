'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createReservation, getReservations, isSlotAvailable } from '@/lib/supabase/queries/reservations';
import { UNAVAILABLE_SLOTS, SERVICES } from '@/lib/mock-data';
import {
  sendAdminNewReservationMessage,
  sendCustomerConfirmationMessage,
  sendCustomerCancellationMessage,
} from '@/lib/whatsapp/twilio';
import type { Reservation, ReservationStatus } from '@/types/app';
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
  | { success: true; bookingRef: string; warning?: string }
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
 *
 * On success, fires a WhatsApp admin notification. If that send fails the
 * reservation is still returned with a non-blocking `warning` string.
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
  const serviceName = SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Dev/demo mode — no Supabase; derive a display code from a random UUID.
    const bookingRef = uuidToDisplayCode(crypto.randomUUID());
    const wa = await sendAdminNewReservationMessage({
      bookingRef,
      serviceName,
      date,
      time,
      customerName: name,
      customerPhone: phone,
      note: note.trim() || undefined,
    });
    return { success: true, bookingRef, warning: wa.warning };
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
    const bookingRef = uuidToDisplayCode(reservation.id);

    // ── WhatsApp admin notification (non-blocking) ─────────────────────────
    const wa = await sendAdminNewReservationMessage({
      bookingRef,
      serviceName,
      date,
      time,
      customerName: name,
      customerPhone: phone,
      note: note.trim() || undefined,
    });

    return { success: true, bookingRef, warning: wa.warning };
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

// ─── Public schedule ─────────────────────────────────────────────────────────

/**
 * Fetch confirmed reservations for a given week (Monday..Sunday).
 * Only `potvrđeno` and `plaćeno` statuses are returned — `novo` is hidden.
 */
export async function getPublicScheduleAction(weekStart: string): Promise<Reservation[]> {
  // Derive weekEnd (Sunday = weekStart + 6 days)
  const start = new Date(`${weekStart}T12:00:00`);
  start.setDate(start.getDate() + 6);
  const weekEnd = start.toISOString().split('T')[0];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return [];
  }

  try {
    const all = await getReservations({
      dateFrom:  weekStart,
      dateTo:    weekEnd,
      limit:     500,
      orderBy:   'reservation_date',
      ascending: true,
    });
    return all.filter((r) => r.status === 'potvrđeno' || r.status === 'plaćeno');
  } catch {
    return [];
  }
}

// ─── Admin status update ──────────────────────────────────────────────────────

/**
 * Update the status of a reservation. Uses the service-role client so that
 * the admin panel works without an authenticated session (demo mode).
 *
 * When status changes to "potvrđeno" or "otkazano", fires a WhatsApp message
 * to the customer. A failed send returns a non-blocking `warning` — the status
 * update is not rolled back.
 */
export async function updateReservationStatusAction(
  id: string,
  status: ReservationStatus,
): Promise<{ success: boolean; error?: string; warning?: string }> {
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
      .select('id, customer_name, customer_phone, service_id, reservation_date, start_time')
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

    // ── WhatsApp customer notification (non-blocking) ─────────────────────
    let warning: string | undefined;

    if (status === 'potvrđeno' || status === 'otkazano') {
      const row = data as Pick<
        ReservationRow,
        'id' | 'customer_name' | 'customer_phone' | 'service_id' | 'reservation_date' | 'start_time'
      >;

      const ctx = {
        bookingRef:    uuidToDisplayCode(row.id),
        serviceName:   SERVICES.find((s) => s.id === row.service_id)?.name ?? row.service_id,
        date:          row.reservation_date,
        time:          row.start_time.slice(0, 5),
        customerName:  row.customer_name,
        customerPhone: row.customer_phone,
      };

      const wa =
        status === 'potvrđeno'
          ? await sendCustomerConfirmationMessage(ctx)
          : await sendCustomerCancellationMessage(ctx);

      warning = wa.warning;
    }

    return { success: true, warning };
  } catch (err) {
    console.error('[updateReservationStatusAction] Unexpected error:', err);
    return { success: false, error: String(err) };
  }
}
