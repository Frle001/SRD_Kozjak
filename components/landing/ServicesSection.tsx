'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SERVICES } from '@/lib/mock-data';
import { formatDuration } from '@/lib/utils';
import { fadeUp, staggerContainer } from '@/lib/animations';

export default function ServicesSection() {
  return (
    <section id="usluge" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
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
        </motion.div>

        {/* Service cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {SERVICES.map((service) => (
            <motion.div
              key={service.id}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-current hover:shadow-md transition-colors duration-200 overflow-hidden ${service.colorClass}`}
            >
              <div className={`h-1.5 w-full ${service.borderClass} bg-current`} />

              <div className="p-6">
                <div
                  className={`w-14 h-14 ${service.bgClass} rounded-xl flex items-center justify-center text-2xl mb-4`}
                >
                  {service.emoji}
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {service.name}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-5 pb-4 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <span>⏱</span>
                    {formatDuration(service.duration)}
                  </span>
                  {service.priceFrom > 0 ? (
                    <span className="flex items-center gap-1">
                      <span>💶</span>
                      od {service.priceFrom} €
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      po dogovoru
                    </span>
                  )}
                </div>

                <Link
                  href={`/rezervacija?usluga=${service.id}`}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${service.bgClass} ${service.colorClass} hover:opacity-90`}
                >
                  Rezerviraj
                  <span className="text-xs">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
