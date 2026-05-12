import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center text-lg shadow-md group-hover:bg-green-400 transition-colors">
            ⚽
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-wide">ŠRD Kozjak</div>
            <div className="text-xs text-slate-400">Sportski centar</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:block text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Početna
          </Link>
          <Link
            href="/#usluge"
            className="hidden sm:block text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Usluge
          </Link>
          <Link
            href="/raspored"
            className="hidden sm:block text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Raspored
          </Link>
          <Link
            href="/rezervacija"
            className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-md"
          >
            Rezerviraj
          </Link>
          <Link
            href="/admin"
            className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 transition-colors"
            title="Admin panel"
          >
            ⚙
          </Link>
        </nav>
      </div>
    </header>
  );
}
