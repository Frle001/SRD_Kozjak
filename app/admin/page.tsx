import AdminDashboard from '@/components/admin/AdminDashboard';
import { getReservations } from '@/lib/supabase/queries/reservations';
import type { Reservation } from '@/types/app';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — ŠRD Kozjak',
  description: 'Upravljanje rezervacijama sportskog centra Kozjak.',
};

// Always render fresh — admin needs live data, not a cached snapshot.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let reservations: Reservation[] = [];

  try {
    reservations = await getReservations({
      orderBy: 'reservation_date',
      ascending: false,
      limit: 500,
    });
  } catch {
    // Supabase not configured or unreachable — dashboard shows empty state.
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Page header stripe */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
              ŠRD Kozjak
            </span>
            <h1 className="text-xl font-black mt-0.5">Admin panel</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-2 rounded-xl">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Demo mode
          </div>
        </div>
      </div>

      <AdminDashboard initialReservations={reservations} />
    </div>
  );
}
