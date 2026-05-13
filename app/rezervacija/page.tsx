import BookingFlow from '@/components/booking/BookingFlow';
import { getServices } from '@/lib/supabase/queries/services';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rezervacija termina — ŠRD Kozjak',
  description: 'Rezervirajte termin online u par koraka.',
};

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ usluga?: string }>;
}) {
  const [{ usluga }, services] = await Promise.all([
    searchParams,
    getServices(),
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-white">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <span className="text-green-600 text-xs font-semibold uppercase tracking-widest">
            Online rezervacija
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
            Rezerviraj termin
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Odaberi uslugu, datum i unesi podatke — brzo i jednostavno.
          </p>
        </div>
      </div>

      <BookingFlow initialServiceId={usluga} services={services} />
    </div>
  );
}
