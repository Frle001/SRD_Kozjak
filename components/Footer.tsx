import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-sm">
                ⚽
              </div>
              <span className="text-white font-bold text-sm">ŠRD Kozjak</span>
            </div>
            <p className="text-sm leading-relaxed">
              Sportsko-rekreacijsko društvo Kozjak — vaše odredište za sport,
              rekreaciju i zabavu u srcu Kozjaka.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Brze veze</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/#usluge" className="hover:text-white transition-colors">
                  Naše usluge
                </Link>
              </li>
              <li>
                <Link href="/rezervacija" className="hover:text-white transition-colors">
                  Rezervacija termina
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Kontakt & radno vrijeme</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+385 91 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>info@srdkozjak.hr</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Kozjak, Hrvatska</span>
              </li>
              <li className="flex items-start gap-2 mt-3">
                <span>🕐</span>
                <div>
                  <div>Pon–Pet: 08:00 – 22:00</div>
                  <div>Sub–Ned: 08:00 – 20:00</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© 2026 ŠRD Kozjak. Sva prava pridržana.</p>
          <div className="flex items-center gap-4">
            <p className="text-slate-600">Izrađeno s ❤️ za Kozjak</p>
            {process.env.NODE_ENV === 'development' && (
              <Link href="/admin" className="text-slate-700 hover:text-slate-500 transition-colors">
                ⚙ admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
