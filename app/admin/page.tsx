import AdminDashboard from '@/components/admin/AdminDashboard';
import { getReservations } from '@/lib/supabase/queries/reservations';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import type { Reservation } from '@/types/app';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — ŠRD Kozjak',
  description: 'Upravljanje rezervacijama sportskog centra Kozjak.',
};

// Always render fresh — admin needs live data, not a cached snapshot.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Defense-in-depth: proxy handles the redirect, but verify here too.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

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
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
              ŠRD Kozjak
            </span>
            <h1 className="text-xl font-black mt-0.5">Admin panel</h1>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="hidden sm:block text-xs text-slate-400 truncate max-w-40">
              {user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors min-h-[36px]"
              >
                Odjava
              </button>
            </form>
          </div>
        </div>
      </div>

      <AdminDashboard initialReservations={reservations} />
    </div>
  );
}
