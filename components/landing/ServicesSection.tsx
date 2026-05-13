import { getServices } from '@/lib/supabase/queries/services';
import ServiceCards from './ServiceCards';

// Server Component — fetches from Supabase, falls back to mock data
export default async function ServicesSection() {
  const services = await getServices();

  return (
    <section id="usluge" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-green-600 text-sm font-semibold uppercase tracking-widest">
            Što nudimo
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            Naše usluge
          </h2>
          <p className="mt-3 text-slate-500 max-w-md mx-auto">
            Od sporta do slavlja — pronađi svoju aktivnost i rezerviraj termin
            za nekoliko klikova.
          </p>
        </div>

        <ServiceCards services={services} />
      </div>
    </section>
  );
}
