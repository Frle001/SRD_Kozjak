'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations';

const TRUST = [
  '✅ Brza potvrda',
  '🔒 Bez registracije',
  '📱 Potvrda na WhatsApp',
  '🆓 Besplatno otkazivanje',
];

export default function CtaSection() {
  return (
    <section className="py-20 bg-white">
      <motion.div
        className="max-w-3xl mx-auto px-4 text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.div
          variants={scaleIn}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
        >
          🏆
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight"
        >
          Spreman/a za igru?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-4 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
        >
          Rezerviraj termin online u nekoliko sekundi. Bez čekanja, bez
          telefona — odaberi uslugu, datum i potvrdi rezervaciju.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/rezervacija"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5"
          >
            Rezerviraj termin
            <span>→</span>
          </Link>
          <Link
            href="/raspored"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-full text-base transition-all"
          >
            <span>📅</span>
            Pogledaj raspored
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold px-8 py-4 rounded-full text-base transition-all border border-amber-200"
          >
            <span>☕</span>
            Caffe meni
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-400"
        >
          {TRUST.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
