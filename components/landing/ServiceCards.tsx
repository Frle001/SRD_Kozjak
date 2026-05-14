'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Service } from '@/types/app';
import { formatDuration } from '@/lib/utils';
import { fadeUp, staggerContainer } from '@/lib/animations';

export default function ServiceCards({ services }: { services: Service[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      {services.map((service) => (
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

            <h3 className="font-bold text-lg text-slate-900 mb-2">{service.name}</h3>

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
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${service.bgClass} ${service.colorClass} hover:opacity-90`}
            >
              Rezerviraj
              <span className="text-xs">→</span>
            </Link>
          </div>
        </motion.div>
      ))}

      {/* ── Caffe Planirka — static card linking to /menu ── */}
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-amber-400 hover:shadow-md transition-colors duration-200 overflow-hidden text-amber-600"
      >
        <div className="h-1.5 w-full bg-amber-400" />

        <div className="p-6">
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-4">
            ☕
          </div>

          <h3 className="font-bold text-lg text-slate-900 mb-2">Caffe Planirka</h3>

          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Opuštena atmosfera uz kavu, sokove, pivo i grickalice. Savršeno
            mjesto za druženje prije ili nakon sportske aktivnosti.
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-5 pb-4 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <span>🕐</span>
              Pon–Pet 08–22 · Sub–Ned 08–20
            </span>
            <span className="flex items-center gap-1">
              <span>💬</span>
              po dogovoru
            </span>
          </div>

          <Link
            href="/menu"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all min-h-[44px] bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            Pogledaj meni
            <span className="text-xs">→</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
