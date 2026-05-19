'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createReservation, isSlotAvailable } from '@/lib/supabase/queries/reservations';
import { UNAVAILABLE_SLOTS, SERVICES, TIME_SLOTS } from '@/lib/mock-data';
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

// Physical location used for schedule_slot blocking, keyed by service_id.
// Distinct from SERVICE_TO_LOCATION in kozjak-schedule.ts (that mapping drives
// the timetable display tab and must remain unchanged).
const BOOKING_LOCATION: Readonly<Record<string, string | null>> = {
  'mali-nogomet': 'teren',
  'stolni-tenis': 'dvorana-2',
  'treninzi':     'dvorana-1',
  'rodendani':    'dvorana-1',
  'caffe-bar':    null,
};

/** Parse 'HH:MM' or 'HH:MM:SS' to minutes since midnight. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Return blocked time slots for the given service and date, split by reason:
 *   takenSlots   — blocked by schedule_slots or confirmed (potvrđeno/plaćeno) reservations → "Zauzeto"
 *   pendingSlots — blocked only by unconfirmed (novo) reservations → "Čeka potvrdu"
 *
 * A slot is blocked when its booking window (slot start → slot start + service duration)
 * overlaps a blocked interval. Overlap test: slotStart < blockedEnd AND slotEnd > blockedStart
 *
 * Falls back to static mock data when Supabase is not configured.
 */
export async function getAvailabilityAction(
  serviceId: string,
  date: string,
): Promise<{ takenSlots: string[]; pendingSlots: string[] }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { takenSlots: UNAVAILABLE_SLOTS[date] ?? [], pendingSlots: [] };
  }

  const durationMin = SERVICES.find((s) => s.id === serviceId)?.duration ?? 60;
  const location    = BOOKING_LOCATION[serviceId] ?? null;

  // day_of_week: Monday = 1, Sunday = 7 (matches schedule_slots convention)
  const jsDay    = new Date(`${date}T12:00:00`).getDay(); // 0 = Sun
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  try {
    // Use the service-role client so that RLS never silently drops rows.
    // This action runs entirely server-side; the data (times + statuses) is
    // not PII and the result is computed server-side before returning to the client.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createServiceClient()) as any;

    // Run all three queries in parallel.
    const [confirmedResult, pendingResult, schedResult] = await Promise.all([
      // ── 1a. Confirmed / paid reservations → "Zauzeto" ──────────────────
      supabase
        .from('reservations')
        .select('start_time, end_time')
        .eq('service_id', serviceId)
        .eq('reservation_date', date)
        .in('status', ['potvrđeno', 'plaćeno']),

      // ── 1b. Pending (novo) reservations → "Čeka potvrdu" ───────────────
      supabase
        .from('reservations')
        .select('start_time, end_time')
        .eq('service_id', serviceId)
        .eq('reservation_date', date)
        .eq('status', 'novo'),

      // ── 2. Recurring schedule blocks → "Zauzeto" ───────────────────────
      location
        ? supabase
            .from('schedule_slots')
            .select('start_hour, end_hour')
            .eq('location_id', location)
            .eq('day_of_week', dayOfWeek)
            .in('status', ['zauzeto', 'rezervirano', 'ceka-potvrdu'])
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (confirmedResult.error) {
      console.error('[getAvailabilityAction] confirmed reservations:', confirmedResult.error.message);
    }
    if (pendingResult.error) {
      console.error('[getAvailabilityAction] pending reservations:', pendingResult.error.message);
    }
    if (schedResult.error) {
      console.error('[getAvailabilityAction] schedule_slots:', schedResult.error.message);
    }

    const confirmedRows = (confirmedResult.data ?? []) as Array<{ start_time: string; end_time: string }>;
    const pendingRows   = (pendingResult.data   ?? []) as Array<{ start_time: string; end_time: string }>;
    const schedRows     = (schedResult.data     ?? []) as Array<{ start_hour: number; end_hour: number }>;

    // ── 3. Build blocked intervals ────────────────────────────────────────
    type Interval = [number, number];
    const confirmedIntervals: Interval[] = [];
    const pendingIntervals:   Interval[] = [];

    for (const r of confirmedRows) {
      confirmedIntervals.push([toMinutes(r.start_time), toMinutes(r.end_time)]);
    }
    for (const s of schedRows) {
      confirmedIntervals.push([s.start_hour * 60, s.end_hour * 60]);
    }
    for (const r of pendingRows) {
      pendingIntervals.push([toMinutes(r.start_time), toMinutes(r.end_time)]);
    }

    // ── 4. Filter TIME_SLOTS by overlap ──────────────────────────────────
    const overlaps = (slot: string, intervals: Interval[]): boolean => {
      const slotStart = toMinutes(slot);
      const slotEnd   = slotStart + durationMin;
      return intervals.some(([bStart, bEnd]) => slotStart < bEnd && slotEnd > bStart);
    };

    const takenSlots = TIME_SLOTS.filter((slot) => overlaps(slot, confirmedIntervals));
    // A slot is "pending" only if it isn't already hard-blocked as "taken"
    const pendingSlots = TIME_SLOTS.filter(
      (slot) => !takenSlots.includes(slot) && overlaps(slot, pendingIntervals),
    );

    return { takenSlots, pendingSlots };
  } catch (err) {
    console.error('[getAvailabilityAction]', err);
    return { takenSlots: [], pendingSlots: [] };
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
 * Fetch confirmed reservations for a given week (Monday..Sunday) for the
 * public schedule view. Only `potvrđeno` and `plaćeno` are returned.
 *
 * Uses the service-role client so that the column-level REVOKE on customer_name,
 * customer_phone, note (which protects PII from the anon key) does not affect
 * this server-side query. Only non-PII columns are selected — the public
 * schedule never displays customer details.
 */
export async function getPublicScheduleAction(weekStart: string): Promise<Reservation[]> {
  // Derive weekEnd (Sunday = weekStart + 6 days)
  const d = new Date(`${weekStart}T12:00:00`);
  d.setDate(d.getDate() + 6);
  const weekEnd = d.toISOString().split('T')[0];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return [];
  }

  try {
    const supabase = await createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('reservations') as any;
    const { data, error } = await table
      .select('id, service_id, reservation_date, start_time, status')
      .in('status', ['potvrđeno', 'plaćeno'])
      .gte('reservation_date', weekStart)
      .lte('reservation_date', weekEnd)
      .order('reservation_date', { ascending: true })
      .limit(500);

    if (error) {
      console.error('[getPublicScheduleAction]', error.message);
      return [];
    }

    // Map the minimal columns to Reservation. PII fields are empty because
    // they are never rendered on the public schedule page.
    return (data as Array<{
      id: string;
      service_id: string;
      reservation_date: string;
      start_time: string;
      status: string;
    }>).map((row) => ({
      id:          row.id,
      serviceId:   row.service_id as Reservation['serviceId'],
      serviceName: SERVICES.find((s) => s.id === row.service_id)?.name ?? row.service_id,
      date:        row.reservation_date,
      time:        row.start_time.slice(0, 5),
      name:        '',
      phone:       '',
      note:        '',
      status:      row.status as Reservation['status'],
      createdAt:   '',
    }));
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
