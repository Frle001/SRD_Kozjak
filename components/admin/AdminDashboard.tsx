'use client';

import { useState, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '@/lib/mock-data';
import type { Reservation, ReservationStatus, ServiceId } from '@/types/app';
import { updateReservationStatusAction } from '@/app/actions/reservations';
import { fadeUp, staggerContainer, slideDown } from '@/lib/animations';
import {
  formatDateHr,
  getStatusLabel,
  getStatusColors,
  getTodayStr,
  getWeekEndStr,
} from '@/lib/utils';

const ALL_STATUSES: ReservationStatus[] = [
  'novo',
  'potvrđeno',
  'plaćeno',
  'otkazano',
];

// Estimated price per service (from mock-data priceFrom)
const SERVICE_PRICE: Record<ServiceId, number> = {
  'mali-nogomet': 30,
  'stolni-tenis': 15,
  rodendani: 200,
  treninzi: 50,
  'caffe-bar': 0,
};

/* ────────────────────────────────────────────────────────────
   Stat card
   ────────────────────────────────────────────────────────────*/
function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden ${gradient}`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />

      <div className="relative">
        <span className="text-xl">{icon}</span>
        <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight leading-none">{value}</div>
        <div className="mt-1 text-xs font-semibold opacity-90 leading-snug">{label}</div>
        <div className="mt-1 text-[10px] opacity-70 leading-snug hidden sm:block">{sub}</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Status badge
   ────────────────────────────────────────────────────────────*/
function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColors(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Status select
   ────────────────────────────────────────────────────────────*/
function StatusSelect({
  value,
  onChange,
}: {
  value: ReservationStatus;
  onChange: (s: ReservationStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ReservationStatus)}
      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-700 bg-white focus:outline-none focus:border-green-500 transition-colors cursor-pointer min-h-[36px]"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {getStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}

/* ────────────────────────────────────────────────────────────
   Today's schedule timeline
   ────────────────────────────────────────────────────────────*/
function TodayTimeline({ reservations }: { reservations: Reservation[] }) {
  const today = getTodayStr();
  const todayItems = reservations
    .filter((r) => r.date === today && r.status !== 'otkazano')
    .sort((a, b) => a.time.localeCompare(b.time));

  const service = (id: ServiceId) => SERVICES.find((s) => s.id === id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Raspored danas</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDateHr(today)}
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {todayItems.length} termin{todayItems.length !== 1 ? 'a' : ''}
        </span>
      </div>

      {todayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-300">
          <span className="text-4xl mb-2">📭</span>
          <span className="text-sm">Nema termina danas</span>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

          <div className="space-y-3">
            {todayItems.map((r) => {
              const svc = service(r.serviceId);
              return (
                <div key={r.id} className="flex gap-3 items-start">
                  {/* Time dot */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                      className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-sm z-10 ${svc?.bgClass ?? 'bg-slate-100'}`}
                    >
                      {svc?.emoji}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {r.time}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-400">{r.serviceName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Service breakdown bar chart
   ────────────────────────────────────────────────────────────*/
function ServiceBreakdown({ reservations }: { reservations: Reservation[] }) {
  const active = reservations.filter((r) => r.status !== 'otkazano');
  const total = active.length || 1;

  const counts = SERVICES.map((svc) => ({
    svc,
    count: active.filter((r) => r.serviceId === svc.id).length,
    revenue: active
      .filter(
        (r) => r.serviceId === svc.id && r.status === 'plaćeno'
      )
      .reduce((sum) => sum + SERVICE_PRICE[svc.id], 0),
  })).sort((a, b) => b.count - a.count);

  // bar fill color per service
  const BAR_COLOR: Record<ServiceId, string> = {
    'mali-nogomet': 'bg-green-500',
    'stolni-tenis': 'bg-blue-500',
    rodendani: 'bg-rose-500',
    treninzi: 'bg-orange-500',
    'caffe-bar': 'bg-amber-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Distribucija usluga
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">sve rezervacije</p>
        </div>
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
          ukupno {active.length}
        </span>
      </div>

      <div className="space-y-4">
        {counts.map(({ svc, count }) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={svc.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span>{svc.emoji}</span>
                  {svc.name}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {count} · {pct}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLOR[svc.id]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status breakdown */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
          Status pregled
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_STATUSES.map((status) => {
            const cnt = reservations.filter((r) => r.status === status).length;
            return (
              <div
                key={status}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
              >
                <StatusBadge status={status} />
                <span className="text-sm font-bold text-slate-700">{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Mobile reservation card
   ────────────────────────────────────────────────────────────*/
function ReservationCard({
  reservation,
  onStatusChange,
}: {
  reservation: Reservation;
  onStatusChange: (id: string, status: ReservationStatus) => void;
}) {
  const svc = SERVICES.find((s) => s.id === reservation.serviceId);
  const fresh = isFresh(reservation);
  const shortCode = `KOZ-${reservation.id.slice(0, 5).toUpperCase()}`;

  return (
    <div className={`w-full rounded-2xl border shadow-sm overflow-hidden ${
      fresh ? 'bg-green-50 border-green-200 ring-1 ring-green-300' : 'bg-white border-slate-200'
    }`}>

      {/* ── Header: emoji · name · service · code ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${svc?.bgClass ?? 'bg-slate-100'}`}>
          {svc?.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-tight truncate">
            {reservation.name}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {reservation.serviceName}
          </p>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1 pl-1">
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
            {shortCode}
          </span>
          {fresh && (
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              🆕 Nova
            </span>
          )}
        </div>
      </div>

      {/* ── Details ── */}
      <div className="border-t border-slate-100 px-4 py-3 space-y-2">
        {/* Date + time on one row */}
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-base leading-none">📅</span>
            {formatDateHr(reservation.date)}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <span className="text-base leading-none">⏰</span>
            {reservation.time}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="text-base leading-none">📞</span>
          <span>{reservation.phone}</span>
        </div>

        {/* Note — truncated, only if present */}
        {reservation.note && (
          <div className="flex items-start gap-1.5 text-xs text-slate-400">
            <span className="text-base leading-none flex-shrink-0">📝</span>
            <span className="truncate">{reservation.note}</span>
          </div>
        )}
      </div>

      {/* ── Footer: status badge + change select ── */}
      <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-3">
        <StatusBadge status={reservation.status} />
        <div className="flex-1 min-w-0">
          <StatusSelect
            value={reservation.status}
            onChange={(s) => onStatusChange(reservation.id, s)}
          />
        </div>
      </div>
    </div>
  );
}

// A reservation is considered "fresh" for 2 minutes after creation
function isFresh(r: Reservation): boolean {
  return Date.now() - new Date(r.createdAt).getTime() < 120_000;
}

/* ────────────────────────────────────────────────────────────
   Main dashboard
   ────────────────────────────────────────────────────────────*/
export default function AdminDashboard({
  initialReservations,
}: {
  initialReservations: Reservation[];
}) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isPending, startTransition] = useTransition();
  const [filterService, setFilterService] = useState<ServiceId | ''>('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  const today = getTodayStr();
  const weekEnd = getWeekEndStr();

  const freshCount = reservations.filter(isFresh).length;

  /* ── Stats ─────────────────────────────────────── */
  const todayCount = reservations.filter(
    (r) => r.date === today && r.status !== 'otkazano'
  ).length;

  const weekItems = reservations.filter(
    (r) =>
      r.date >= today &&
      r.date <= weekEnd &&
      r.status !== 'otkazano'
  );
  const weekCount = weekItems.length;

  const pendingCount = reservations.filter((r) => r.status === 'novo').length;

  const weekRevenue = reservations
    .filter(
      (r) =>
        r.date >= today &&
        r.date <= weekEnd &&
        (r.status === 'plaćeno' || r.status === 'potvrđeno')
    )
    .reduce((sum, r) => sum + SERVICE_PRICE[r.serviceId], 0);

  /* ── Filtered list ─────────────────────────────── */
  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (filterService && r.serviceId !== filterService) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterDate && r.date !== filterDate) return false;
      if (
        search &&
        !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.phone.includes(search) &&
        !r.id.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [reservations, filterService, filterStatus, filterDate, search]);

  function handleStatusChange(id: string, status: ReservationStatus) {
    // Capture previous status so we can revert if the server call fails.
    const previous = reservations.find((r) => r.id === id)?.status;

    // Optimistic update — UI reflects the change immediately.
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

    startTransition(async () => {
      const result = await updateReservationStatusAction(id, status);
      if (!result.success) {
        // Revert to previous status on failure.
        console.error('[AdminDashboard] Status update failed:', result.error);
        if (previous !== undefined) {
          setReservations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: previous } : r)),
          );
        }
      }
    });
  }

  function clearFilters() {
    setFilterService('');
    setFilterStatus('');
    setFilterDate('');
    setSearch('');
  }

  const hasFilters = filterService || filterStatus || filterDate || search;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* ── Fresh reservation banner ─────────────────────── */}
      <AnimatePresence>
      {freshCount > 0 && (
        <motion.div
          key="fresh-banner"
          variants={slideDown}
          initial="hidden"
          animate="show"
          exit="exit"
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5"
        >
          <span className="relative flex-shrink-0">
            <span className="w-3 h-3 bg-green-500 rounded-full flex" />
            <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
          </span>
          <p className="text-sm font-semibold text-green-800">
            {freshCount === 1
              ? '1 nova rezervacija upravo zaprimljena!'
              : `${freshCount} novih rezervacija upravo zaprimljeno!`}
          </p>
          <span className="ml-auto text-xs text-green-600 bg-green-100 px-2.5 py-1 rounded-full font-medium flex-shrink-0 hidden sm:inline-flex">
            istaknuto zeleno ↓
          </span>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Stat cards ────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            icon="📅"
            label="Rezervacije danas"
            value={String(todayCount)}
            sub="aktivni termini"
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            icon="📆"
            label="Ovaj tjedan"
            value={String(weekCount)}
            sub={`do ${formatDateHr(weekEnd)}`}
            gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            icon="⏳"
            label="Čeka potvrdu"
            value={String(pendingCount)}
            sub={pendingCount > 0 ? 'potrebna akcija' : 'sve potvrđeno'}
            gradient={
              pendingCount > 0
                ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                : 'bg-gradient-to-br from-slate-500 to-slate-700'
            }
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            icon="💶"
            label="Procij. prihod tjedan"
            value={`${weekRevenue} €`}
            sub="potvrđeno + plaćeno"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
        </motion.div>
      </motion.div>

      {/* ── Middle: Timeline + Chart ──────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}><TodayTimeline reservations={reservations} /></motion.div>
        <motion.div variants={fadeUp}><ServiceBreakdown reservations={reservations} /></motion.div>
      </motion.div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🔍</span>
          <h3 className="font-bold text-slate-900 text-sm">
            Sve rezervacije
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:items-end">
          <div className="sm:col-span-2 lg:flex-1 lg:min-w-44">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Pretraži
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ime, telefon ili ID..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors min-h-[44px]"
            />
          </div>

          <div className="lg:min-w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Usluga
            </label>
            <select
              value={filterService}
              onChange={(e) =>
                setFilterService(e.target.value as ServiceId | '')
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500 transition-colors min-h-[44px]"
            >
              <option value="">Sve usluge</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:min-w-36">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ReservationStatus | '')
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-green-500 transition-colors min-h-[44px]"
            >
              <option value="">Svi statusi</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 sm:col-span-2 lg:col-span-1 lg:min-w-40">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Datum
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-green-500 transition-colors min-h-[44px]"
              />
            </div>

            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="py-2.5 px-4 text-sm text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[44px] whitespace-nowrap"
                >
                  Očisti
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          Prikazano{' '}
          <span className="font-semibold text-slate-600">{filtered.length}</span>{' '}
          od {reservations.length} rezervacija
        </div>
      </div>

      {/* ── Mobile cards ──────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Nema rezultata za odabrane filtere.
          </div>
        ) : (
          filtered.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* ── Desktop table ─────────────────────────────────── */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  'ID',
                  'Usluga',
                  'Datum',
                  'Vrijeme',
                  'Ime',
                  'Telefon',
                  'Napomena',
                  'Status',
                  'Promijeni',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-slate-400"
                  >
                    <div className="text-3xl mb-2">🔎</div>
                    Nema rezultata za odabrane filtere.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const svc = SERVICES.find((s) => s.id === r.serviceId);
                  const fresh = isFresh(r);
                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors group ${
                        fresh
                          ? 'bg-green-50 hover:bg-green-50/80'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {fresh && (
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
                          )}
                          <span className={`font-mono text-xs px-2 py-0.5 rounded transition-colors ${fresh ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                            {r.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${svc?.bgClass ?? ''}`}
                          >
                            {svc?.emoji}
                          </span>
                          <span className="font-medium text-slate-800">
                            {r.serviceName}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {formatDateHr(r.date)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                          {r.time}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                        {r.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                        {r.phone}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 max-w-44 truncate text-xs">
                        {r.note || (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusSelect
                          value={r.status}
                          onChange={(s) => handleStatusChange(r.id, s)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filtered.length} rezervacija prikazano
          </span>
          <span className="text-xs text-slate-400">
            Promjena statusa se sprema automatski
          </span>
        </div>
      </div>
    </div>
  );
}
