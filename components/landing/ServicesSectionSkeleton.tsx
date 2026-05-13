/** Skeleton shown via Suspense while ServicesSection fetches from Supabase. */
export default function ServicesSectionSkeleton() {
  return (
    <section id="usluge" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header — identical to the real section so layout doesn't shift */}
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

        {/* Card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border-2 border-transparent overflow-hidden"
            >
              {/* Accent bar */}
              <div className="h-1.5 w-full bg-slate-200 animate-pulse" />

              <div className="p-6 space-y-4">
                {/* Emoji block */}
                <div className="w-14 h-14 bg-slate-200 rounded-xl animate-pulse" />

                {/* Title */}
                <div className="h-5 w-36 bg-slate-200 rounded-lg animate-pulse" />

                {/* Description — two lines */}
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-3.5 w-4/5 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3.5 w-3/5 bg-slate-100 rounded animate-pulse" />
                </div>

                {/* Duration + price row */}
                <div className="flex items-center justify-between pt-1 pb-4 border-b border-slate-100">
                  <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                </div>

                {/* Button */}
                <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
