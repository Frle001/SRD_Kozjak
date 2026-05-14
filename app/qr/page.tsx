import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ŠRD Kozjak — Dobrodošli',
  description: 'Rezervirajte teren, pogledajte raspored ili menu Caffe Planirka.',
};

interface ActionButtonProps {
  href: string;
  emoji: string;
  label: string;
  sub: string;
  variant?: 'primary' | 'amber' | 'default' | 'ghost';
  external?: boolean;
}

function ActionButton({ href, emoji, label, sub, variant = 'default', external }: ActionButtonProps) {
  const base =
    'flex items-center gap-4 w-full rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98] min-h-[72px]';

  const styles = {
    primary: `${base} bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-900/30`,
    amber:   `${base} bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-900/30`,
    default: `${base} bg-white/10 hover:bg-white/20 text-white border border-white/15`,
    ghost:   `${base} bg-white text-slate-800 hover:bg-slate-50 shadow-sm border border-slate-200`,
  };

  const inner = (
    <>
      <span className="text-2xl flex-shrink-0 leading-none">{emoji}</span>
      <div className="min-w-0">
        <div className="font-bold text-base leading-tight">{label}</div>
        <div className={`text-xs mt-0.5 leading-snug ${variant === 'ghost' ? 'text-slate-500' : 'opacity-75'}`}>
          {sub}
        </div>
      </div>
      <span className={`ml-auto text-lg flex-shrink-0 ${variant === 'ghost' ? 'text-slate-400' : 'opacity-50'}`}>
        →
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} className={styles[variant]} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={styles[variant]}>
      {inner}
    </Link>
  );
}

export default function QrPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* ── Branding header ── */}
      <div className="flex-shrink-0 px-6 pt-12 pb-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg shadow-green-900/40">
          ⚽
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">ŠRD Kozjak</h1>
        <p className="text-slate-400 text-sm mt-1">Sportsko-rekreacijsko društvo</p>

        {/* Live indicator */}
        <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5 mt-4">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-xs text-slate-300 font-medium">Online rezervacije dostupne</span>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex-1 px-5 pb-10 space-y-3 max-w-md mx-auto w-full">

        {/* Caffe menu — amber branded */}
        <ActionButton
          href="/menu"
          emoji="☕"
          label="Caffe Planirka — Meni"
          sub="Kava, pića, hrana i cijene"
          variant="amber"
        />

        {/* Reservation buttons */}
        <ActionButton
          href="/rezervacija?usluga=mali-nogomet"
          emoji="⚽"
          label="Rezerviraj teren"
          sub="Mali nogomet · od 30 €/h"
          variant="default"
        />

        <ActionButton
          href="/rezervacija?usluga=rodendani"
          emoji="🎂"
          label="Rezerviraj rođendan"
          sub="Djeca i odrasli · od 200 €"
          variant="default"
        />

        <ActionButton
          href="/raspored"
          emoji="📅"
          label="Pogledaj raspored"
          sub="Slobodni termini ovaj tjedan"
          variant="default"
        />

        {/* Divider */}
        <div className="border-t border-slate-800 my-1" />

        {/* Call button — lighter style */}
        <ActionButton
          href="tel:+385910000000"
          emoji="📞"
          label="Nazovi nas"
          sub="+385 91 000 0000"
          variant="ghost"
          external
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-5 pb-8 text-center">
        <p className="text-[11px] text-slate-600">
          Kozjak, Hrvatska · pon–pet 08–22 · sub–ned 08–20
        </p>
      </div>
    </div>
  );
}
