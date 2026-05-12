'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';

const BENEFITS = [
  {
    emoji: '📞',
    title: 'Manje poziva',
    description:
      'Gosti sami biraju termin online — u bilo koje doba dana. Prestanite primati pozive usred treninga ili kasno navečer.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
  },
  {
    emoji: '📋',
    title: 'Pregled svih termina',
    description:
      'Sve rezervacije na jednom zaslonu, filtrirane po datumu, usluzi i statusu. Odmah vidite što vas čeka sutra ujutro.',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-100',
  },
  {
    emoji: '🚫',
    title: 'Manje duplih rezervacija',
    description:
      'Sustav automatski blokira zauzete termine. Kraj neugodnih situacija kad dva gosta dođu u isto vrijeme.',
    color: 'bg-rose-50 text-rose-600',
    border: 'border-rose-100',
  },
  {
    emoji: '⚡',
    title: 'Brža potvrda termina',
    description:
      'Jednim klikom šaljete WhatsApp potvrdu direktno gostu. Profesionalno, trenutačno i bez tipkanja poruke od nule.',
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },
  {
    emoji: '🎂',
    title: 'Bolja organizacija rođendana',
    description:
      'Broj djece, napomene, posebni zahtjevi i plaćanje — sve vidljivo na jednoj kartici. Nema više "zaboravljenih" detalja.',
    color: 'bg-purple-50 text-purple-600',
    border: 'border-purple-100',
  },
];

const COMPARISON = [
  {
    before: 'Telefon zvoni dok vodite trening ili kasno navečer',
    after: 'Gosti rezerviraju sami, online, u bilo koje doba',
  },
  {
    before: 'Papirne bilješke i Excel tablice koje se gube',
    after: 'Sve digitalno — dostupno s mobitela, uvijek ažurno',
  },
  {
    before: 'Duple rezervacije i neugodne situacije s gostima',
    after: 'Sustav automatski blokira zauzete termine',
  },
  {
    before: 'Ručno tipkanje WhatsApp poruke svakom gostu',
    after: 'Potvrda jednim klikom, direktno na gostov mobitel',
  },
  {
    before: '"Koji datum je bio taj rođendan...?" — panika',
    after: 'Sve napomene odmah vidljive u admin panelu',
  },
  {
    before: 'Ne znaš tko je platio, a tko ne',
    after: 'Praćenje statusa: Novo → Potvrđeno → Plaćeno',
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-slate-900 pb-0">
      {/* ── Dark header ─────────────────────────────────────────── */}
      <motion.div
        className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <span className="inline-block bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          Za vlasnike sportskih centara
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
          Što dobivate
          <br />
          <span className="text-green-400">ovim sustavom</span>
        </h2>

        <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Zaboravite na kaotične bilješke i pozive u krivo doba. Uz digitalni
          sustav rezervacija, vaš sportski centar radi kao dobro podmazan stroj
          — i kad vi ne radite.
        </p>
      </motion.div>

      {/* ── Benefit cards ────────────────────────────────────────── */}
      <div className="bg-slate-50">
        <motion.div
          className="max-w-6xl mx-auto px-4 -translate-y-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={`bg-white rounded-2xl border-2 ${b.border} p-6 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${b.color}`}
                >
                  {b.emoji}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {b.description}
                </p>
                <div className="mt-4 text-xs font-bold text-slate-300">
                  0{i + 1}
                </div>
              </motion.div>
            ))}

            {/* Admin demo CTA card */}
            <motion.div
              variants={fadeUp}
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-sm text-white flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl mb-4">
                  🖥️
                </div>
                <h3 className="font-bold mb-2">Pogledajte admin panel</h3>
                <p className="text-sm text-green-100 leading-relaxed">
                  Sve rezervacije, filteri i promjena statusa — direktno iz
                  preglednika, bez instalacije.
                </p>
              </div>
              <a
                href="/admin"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-green-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                Otvori demo →
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Before / After comparison ───────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 pb-20 -mt-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-center text-xl font-black text-slate-900 mb-2">
              Kako je bilo vs. kako je sada
            </h3>
            <p className="text-center text-slate-500 text-sm mb-8">
              Svaki sportski centar koji je uveo online rezervacije kaže isto.
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
              <div className="grid grid-cols-2">
                <div className="bg-red-50 px-5 py-3 border-b border-r border-slate-200">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                    ❌ Bez sustava
                  </span>
                </div>
                <div className="bg-green-50 px-5 py-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                    ✅ Sa sustavom
                  </span>
                </div>
              </div>

              {COMPARISON.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-2 ${
                    i < COMPARISON.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="px-5 py-4 border-r border-slate-100 flex items-start gap-2.5">
                    <span className="text-red-400 mt-0.5 flex-shrink-0 text-sm">✕</span>
                    <span className="text-sm text-slate-500 leading-snug">
                      {row.before}
                    </span>
                  </div>
                  <div className="px-5 py-4 flex items-start gap-2.5">
                    <span className="text-green-500 mt-0.5 flex-shrink-0 text-sm">✓</span>
                    <span className="text-sm text-slate-800 font-medium leading-snug">
                      {row.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-slate-900 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <span className="text-4xl flex-shrink-0">💬</span>
              <div>
                <p className="text-white font-semibold text-sm leading-relaxed">
                  &ldquo;Otkad smo uveli online rezervacije, broj telefonskih poziva
                  pao je za više od 70%. Sada imamo vremena za ono što je
                  važno.&rdquo;
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  — Vlasnik sportskog centra, Zagreb
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
