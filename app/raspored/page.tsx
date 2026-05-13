import type { Metadata } from 'next';
import SchedulePage from '@/components/schedule/SchedulePage';
import { getReservations } from '@/lib/supabase/queries/reservations';
import type { Reservation } from '@/types/app';

export const metadata: Metadata = {
  title: 'Raspored — ŠRD Kozjak',
  description: 'Tjedni i dnevni raspored aktivnosti u ŠRD Kozjak sportskom centru.',
};

export const dynamic = 'force-dynamic';

/** Return the ISO date (YYYY-MM-DD) of Monday for the week containing `date`. */
function getMondayStr(date: Date): string {
  const dow = date.getDay(); // 0=Sun
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1));
  return monday.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default async function RasporedPage() {
  const weekStart = getMondayStr(new Date());
  const weekEnd   = addDays(weekStart, 6);

  let reservations: Reservation[] = [];
  try {
    const all = await getReservations({
      dateFrom:  weekStart,
      dateTo:    weekEnd,
      limit:     500,
      orderBy:   'reservation_date',
      ascending: true,
    });
    // Only active bookings occupy slots; cancelled ones free up the time.
    reservations = all.filter((r) => r.status !== 'otkazano');
  } catch {
    // Supabase not configured — timetable shows recurring schedule only.
  }

  return <SchedulePage reservations={reservations} weekStart={weekStart} />;
}
