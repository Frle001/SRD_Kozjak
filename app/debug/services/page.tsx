import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { mapService } from '@/lib/mappers';
import type { DbService } from '@/types/database';
import type { Service } from '@/types/app';

export const dynamic = 'force-dynamic';

// ─── JSON block ───────────────────────────────────────────────────────────────

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
        {label}
      </p>
      <pre className="bg-slate-950 text-green-300 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed h-full">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ─── Single service row ───────────────────────────────────────────────────────

function ServiceRow({ raw, mapped }: { raw: DbService; mapped: Service }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-xl">{mapped.emoji}</span>
        <div>
          <p className="font-bold text-slate-900 text-sm">{mapped.name}</p>
          <p className="text-xs text-slate-400 font-mono">{raw.id}</p>
        </div>
        <span
          className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
            raw.active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {raw.active ? 'active' : 'inactive'}
        </span>
      </div>

      {/* JSON columns */}
      <div className="flex gap-4 p-5">
        <JsonBlock label="DB row (snake_case)" data={raw} />
        <JsonBlock label="Mapped (camelCase)" data={mapped} />
      </div>
    </div>
  );
}

// ─── Main content (async — does the fetching) ─────────────────────────────────

async function ServiceDebugContent() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Supabase not configured
        </p>
        <p className="text-xs text-amber-600">
          Set <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
          and <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
          in your <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> to fetch live data.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5">
        <p className="text-sm font-semibold text-red-800 mb-1">Supabase error</p>
        <pre className="text-xs text-red-600 font-mono whitespace-pre-wrap">
          {error.message}
        </pre>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-center">
        <p className="text-sm text-slate-500">
          No rows found in the <code className="font-mono">services</code> table.
        </p>
      </div>
    );
  }

  const rows = data as DbService[];

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        {rows.length} row{rows.length !== 1 ? 's' : ''} fetched from{' '}
        <code className="font-mono bg-slate-100 px-1 rounded">public.services</code>
      </p>

      {rows.map((raw) => (
        <ServiceRow key={raw.id} raw={raw} mapped={mapService(raw)} />
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-28 h-3.5 bg-slate-200 rounded animate-pulse" />
              <div className="w-20 h-2.5 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4 p-5">
            <div className="flex-1 h-48 bg-slate-950/5 rounded-xl animate-pulse" />
            <div className="flex-1 h-48 bg-slate-950/5 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DebugServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
            Debug · Architecture
          </span>
          <h1 className="text-xl font-black mt-0.5">Services — DB vs Mapped</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Raw rows from{' '}
            <code className="font-mono text-slate-300">public.services</code>{' '}
            (snake_case) beside their mapped frontend objects (camelCase).
            Uses the <code className="font-mono text-slate-300">mapService</code> mapper from{' '}
            <code className="font-mono text-slate-300">lib/mappers/</code>.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <ServiceDebugContent />
        </Suspense>
      </div>
    </div>
  );
}
