'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp, staggerSlow } from '@/lib/animations';

const STATS = [
  { value: '5+', label: 'sportova' },
  { value: '200+', label: 'članova' },
  { value: '7/7', label: 'dana otvoreni' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col text-white">
      {/* ── Background image ─────────────────────────────── */}
      <Image
        src="/images/kozjak-hero.png"
        alt="ŠRD Kozjak sportski centar"
        fill
        priority
        quality={90}
        className="object-cover object-center"
      />

      {/* ── Dark overlay — keeps text readable ───────────── */}
      <div className="absolute inset-0 bg-slate-900/65" />

      {/* ── Subtle gradient tint on top of photo ─────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-green-950/50" />

      {/* ── Green/blue glow blobs ─────────────────────────── */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 pointer-events-none" />

      {/* ── Grid pattern overlay ──────────────────────────── */}
      <div className="hero-pattern absolute inset-0 pointer-events-none" />

      {/* ── Content ──────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-0 w-full">
          <motion.div
            className="max-w-2xl"
            variants={staggerSlow}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Sportski centar Kozjak
            </motion.span>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight"
            >
              Tvoje sportsko
              <br />
              <span className="text-green-400">odredište</span>
              <br />
              u srcu Kozjaka
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-slate-200 leading-relaxed max-w-xl"
            >
              Mali nogomet, stolni tenis, treninzi, rođendani i caffe bar — sve na
              jednom mjestu. Rezerviraj termin online za par sekundi.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/rezervacija"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-7 py-3.5 rounded-full text-base transition-all shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Rezerviraj termin</span>
                <span>→</span>
              </Link>
              <a
                href="#usluge"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-full text-base transition-all hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm"
              >
                Naše usluge
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom wave into next section ─────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 bg-slate-50"
        style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
      />
    </section>
  );
}
