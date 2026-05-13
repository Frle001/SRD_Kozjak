'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MENU_CATEGORIES } from '@/lib/menu-data';
import type { MenuCategory } from '@/lib/menu-data';

function formatPrice(price: number | null): string {
  if (price === null) return 'Po dogovoru';
  return `${price.toFixed(2).replace('.', ',')} €`;
}

/* ── Category tab ── */
function CategoryTab({
  category,
  active,
  onClick,
}: {
  category: MenuCategory;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] whitespace-nowrap ${
        active
          ? 'bg-amber-500 text-white shadow-md'
          : 'bg-white/10 text-slate-300 hover:bg-white/20'
      }`}
    >
      <span>{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
}

/* ── Menu item row ── */
function MenuItemRow({ name, price, description }: { name: string; price: number | null; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 leading-snug">{name}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <span className={`flex-shrink-0 text-sm font-bold tabular-nums ${price === null ? 'text-slate-400' : 'text-amber-600'}`}>
        {formatPrice(price)}
      </span>
    </div>
  );
}

/* ── Main page ── */
export default function MenuPage() {
  const [activeId, setActiveId] = useState(MENU_CATEGORIES[0].id);
  const active = MENU_CATEGORIES.find((c) => c.id === activeId)!;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-slate-900 px-5 pt-10 pb-5">
        <Link
          href="/qr"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-5 transition-colors"
        >
          ← Nazad
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-amber-900/30">
            ☕
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Caffe Planirka</h1>
            <p className="text-slate-400 text-xs mt-0.5">ŠRD Kozjak · Cjenik</p>
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-4 leading-snug">
          Sve cijene u eurima (€) · PDV uključen · Cijene podložne promjeni
        </p>
      </div>

      {/* ── Category tabs — horizontal scroll ── */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
          {MENU_CATEGORIES.map((cat) => (
            <CategoryTab
              key={cat.id}
              category={cat}
              active={cat.id === activeId}
              onClick={() => setActiveId(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Menu items ── */}
      <div className="flex-1 bg-slate-50">
        <div className="max-w-lg mx-auto px-5 py-4">

          {/* Category heading */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{active.emoji}</span>
            <h2 className="text-lg font-black text-slate-900">{active.label}</h2>
            <span className="ml-auto text-xs text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full font-medium">
              {active.items.length} stavki
            </span>
          </div>

          {/* Items card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 overflow-hidden">
            {active.items.map((item) => (
              <MenuItemRow
                key={item.name}
                name={item.name}
                price={item.price}
                description={item.description}
              />
            ))}
          </div>

          {/* Note */}
          <p className="text-xs text-slate-400 text-center mt-4 leading-snug px-2">
            Pitajte konobare za dnevne specijale i sezonsku ponudu.
          </p>
        </div>
      </div>

      {/* ── Sticky CTA footer ── */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-5 py-4 safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link
            href="/rezervacija"
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors shadow-md min-h-[52px]"
          >
            <span>⚽</span>
            Rezerviraj teren
          </Link>
          <Link
            href="/rezervacija?usluga=rodendani"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors min-h-[52px]"
          >
            <span>🎂</span>
            Rođendan
          </Link>
        </div>
      </div>
    </div>
  );
}
