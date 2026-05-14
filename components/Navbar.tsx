'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group flex-shrink-0"
          onClick={() => setOpen(false)}
        >
          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center text-lg shadow-md group-hover:bg-green-400 transition-colors">
            ⚽
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-wide">ŠRD Kozjak</div>
            <div className="text-xs text-slate-400">Sportski centar</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {/* md+ only — avoid cramping at 640px */}
          <Link href="/" className="hidden md:block text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
            Početna
          </Link>
          <Link href="/raspored" className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
            Raspored
          </Link>
          <Link href="/menu" className="text-sm text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
            ☕ Caffe meni
          </Link>
          <Link href="/qr" className="hidden md:block text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
            Brzi pristup
          </Link>
          <Link href="/rezervacija" className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-md whitespace-nowrap ml-1">
            Rezerviraj
          </Link>
        </nav>

        {/* Mobile right side: CTA + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/rezervacija"
            className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-md"
            onClick={() => setOpen(false)}
          >
            Rezerviraj
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Zatvori izbornik' : 'Otvori izbornik'}
            aria-expanded={open}
            className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            <span className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu — slides down. max-h-[30rem] fits 6 items comfortably */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="bg-slate-900 border-t border-slate-800 px-4 pb-4 pt-2 flex flex-col gap-1">
          <MobileNavLink href="/"          label="Početna"       onClose={() => setOpen(false)} />
          <MobileNavLink href="/raspored"  label="Raspored"      onClose={() => setOpen(false)} />
          <MobileNavLink href="/menu"      label="☕ Caffe meni" onClose={() => setOpen(false)} amber />
          <MobileNavLink href="/qr"        label="📱 Brzi pristup" onClose={() => setOpen(false)} />
          <MobileNavLink href="/rezervacija" label="Rezerviraj"  onClose={() => setOpen(false)} highlight />
        </nav>
      </div>
    </header>
  );
}

function MobileNavLink({
  href,
  label,
  highlight,
  subtle,
  amber,
  onClose,
}: {
  href: string;
  label: string;
  highlight?: boolean;
  subtle?: boolean;
  amber?: boolean;
  onClose: () => void;
}) {
  const cls = highlight
    ? 'bg-green-500 hover:bg-green-400 text-white font-semibold'
    : amber
    ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
    : subtle
    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
    : 'text-slate-200 hover:text-white hover:bg-slate-800';

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] flex items-center ${cls}`}
    >
      {label}
    </Link>
  );
}
