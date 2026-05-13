'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WeeklyTimetable from './WeeklyTimetable';
import ScheduleFilters from './ScheduleFilters';
import {
  LOCATION_CONFIG,
  ACTIVITY_CONFIG,
  RECURRING_SCHEDULE,
  SERVICE_TO_LOCATION,
  countFreeHours,
} from '@/lib/kozjak-schedule';
import type { Location, SlotStatus, ActivityType, ReservationBlock } from '@/lib/kozjak-schedule';
import { SERVICES } from '@/lib/mock-data';
import type { Reservation } from '@/types/app';
import { fadeUp, staggerContainer } from '@/lib/animations';

/** Convert a YYYY-MM-DD date string to ISO day-of-week (1=Mon … 7=Sun). */
function dateToDayOfWeek(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00`); // noon avoids DST edge cases
  const dow = d.getDay(); // 0=Sun
  return dow === 0 ? 7 : dow;
}

/** Map app reservation status to schedule SlotStatus. */
function toSlotStatus(status: string): 'rezervirano' | 'ceka-potvrdu' {
  return status === 'potvrđeno' || status === 'plaćeno' ? 'rezervirano' : 'ceka-potvrdu';
}

/** Parse 'HH:MM' to the integer hour. */
function startHourFromTime(timeStr: string): number {
  return parseInt(timeStr, 10);
}

/** Compute endHour from serviceId duration (ceiling to whole hours). */
function endHourFromServiceId(serviceId: string, startHour: number): number {
  const durationMin = SERVICES.find((s) => s.id === serviceId)?.duration ?? 60;
  return startHour + Math.ceil(durationMin / 60);
}

/**
 * Build a map of dayOfWeek → ReservationBlock[] for a given location,
 * using the reservations fetched from Supabase for the current week.
 */
function buildDayReservations(
  reservations: Reservation[],
  location: Location,
): Map<number, ReservationBlock[]> {
  const map = new Map<number, ReservationBlock[]>();

  for (const r of reservations) {
    if (SERVICE_TO_LOCATION[r.serviceId] !== location) continue;

    const dayOfWeek = dateToDayOfWeek(r.date);
    const startHour = startHourFromTime(r.time);
    const endHour   = endHourFromServiceId(r.serviceId, startHour);
    if (startHour >= endHour) continue;

    const block: ReservationBlock = {
      startHour,
      endHour,
      slotStatus:  toSlotStatus(r.status),
      serviceName: r.serviceName,
    };

    const existing = map.get(dayOfWeek) ?? [];
    existing.push(block);
    map.set(dayOfWeek, existing);
  }

  return map;
}

const LOCATIONS: Location[] = ['teren', 'dvorana-1', 'dvorana-2'];

// Activities that appear in each location (for the legend)
const LOCATION_ACTIVITIES: Record<Location, ActivityType[]> = {
  teren:       ['ns', 'termini'],
  'dvorana-1': ['igraonica', 'ples', 'pilates', 'plesni'],
  'dvorana-2': ['stolni-tenis', 'judo'],
};

// Weekly free hours per location (sum across all days)
function totalFreeHours(location: Location): number {
  return [1, 2, 3, 4, 5, 6, 7].reduce((s, d) => s + countFreeHours(location, d), 0);
}

// Occupied hours per week (from RECURRING_SCHEDULE)
function totalOccupiedHours(location: Location): number {
  return RECURRING_SCHEDULE
    .filter((e) => e.location === location)
    .reduce((s, e) => s + e.endHour - e.startHour, 0);
}

// ─── Location tab ─────────────────────────────────────────────────────────────

function LocationTab({
  location,
  selected,
  onClick,
}: {
  location: Location;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = LOCATION_CONFIG[location];
  const free = totalFreeHours(location);

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all border ${
        selected
          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
      }`}
    >
      <span className="text-base">{cfg.emoji}</span>
      <span>{cfg.shortLabel}</span>
      <span
        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          selected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        {free}h slobodno
      </span>
    </button>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ location }: { location: Location }) {
  const types = LOCATION_ACTIVITIES[location];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Legenda
      </p>
      <div className="space-y-2">
        {types.map((t) => {
          const cfg = ACTIVITY_CONFIG[t];
          return (
            <div key={t} className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${cfg.bg}`} />
              <span className="text-xs text-slate-600 font-medium">
                {cfg.emoji} {cfg.name}
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100">
          <span className="w-3 h-3 rounded-sm border border-dashed border-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-600 font-medium">Slobodan termin</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-sm bg-slate-100 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-medium">Zatvoreno</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip({ location }: { location: Location }) {
  const occ = totalOccupiedHours(location);
  const free = totalFreeHours(location);
  const total = occ + free;
  const pct = total > 0 ? Math.round((occ / total) * 100) : 0;

  const activities = RECURRING_SCHEDULE.filter((e) => e.location === location);
  const uniqueTypes = [...new Set(activities.map((e) => e.activityType))].length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-3"
    >
      {[
        { label: 'Zauzeto tjedno', value: `${occ}h`, sub: `${pct}% iskorištenosti`, icon: '📋' },
        { label: 'Slobodno tjedno', value: `${free}h`, sub: 'dostupno za rezervaciju', icon: '✅' },
        { label: 'Aktivnosti', value: uniqueTypes, sub: 'različitih programa', icon: '🏃' },
      ].map(({ label, value, sub, icon }) => (
        <motion.div
          key={label}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
        >
          <div className="text-xl mb-1">{icon}</div>
          <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">{label}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage({
  reservations = [],
  weekStart,
}: {
  reservations?: Reservation[];
  weekStart?: string;
}) {
  const [location, setLocation] = useState<Location>('teren');
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<SlotStatus[]>([]);

  function toggleDay(d: number) {
    setActiveDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function toggleStatus(s: SlotStatus) {
    setActiveStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function resetFilters() {
    setActiveDays([]);
    setActiveStatuses([]);
  }

  function handleLocationChange(l: Location) {
    setLocation(l);
    resetFilters();
  }

  const locCfg = LOCATION_CONFIG[location];

  // Rebuild the reservation overlay whenever location or data changes.
  const dayReservations = useMemo(
    () => buildDayReservations(reservations, location),
    [reservations, location],
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
                ŠRD Kozjak
              </span>
              <h1 className="text-2xl font-black mt-0.5">Raspored termina</h1>
              <p className="text-slate-400 text-sm mt-1">
                {locCfg.label} — tjedni pregled zauzetosti i slobodnih termina
              </p>
            </div>

            {/* Admin note */}
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2">
              <span className="text-slate-400 text-xs">📄</span>
              <p className="text-[11px] text-slate-400 leading-snug max-w-56">
                Digitalizirano iz postojećeg rasporeda termina ŠRD Kozjak
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Location tabs */}
        <div className="flex gap-2 flex-wrap">
          {LOCATIONS.map((l) => (
            <LocationTab
              key={l}
              location={l}
              selected={location === l}
              onClick={() => handleLocationChange(l)}
            />
          ))}
          <div className="ml-auto flex-shrink-0">
            <Link
              href="/rezervacija"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors shadow-md"
            >
              <span>＋</span> Nova rezervacija
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <StatsStrip location={location} />

        {/* Filters */}
        <ScheduleFilters
          activeDays={activeDays}
          onDayToggle={toggleDay}
          activeStatuses={activeStatuses}
          onStatusToggle={toggleStatus}
          onReset={resetFilters}
        />

        {/* Main layout: timetable + sidebar */}
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Timetable */}
          <div className="flex-1 min-w-0">
            <WeeklyTimetable
              location={location}
              activeDays={activeDays}
              activeStatuses={activeStatuses}
              dayReservations={dayReservations}
              weekStart={weekStart}
            />
          </div>

          {/* Sidebar */}
          <div className="xl:w-56 flex-shrink-0 space-y-4">
            <Legend location={location} />

            {/* Contacts info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Kontakti
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                {location === 'teren' && (
                  <>
                    <p className="font-semibold text-slate-700">Nogometna škola</p>
                    <p>Andrija Puškarić</p>
                    <p className="text-slate-400">095 917 6050</p>
                    <p className="mt-2 font-semibold text-slate-700">Termini za građane</p>
                    <p>Dino Dautbegović</p>
                    <p className="text-slate-400">097 699 3184</p>
                  </>
                )}
                {location === 'dvorana-1' && (
                  <>
                    <p className="font-semibold text-slate-700">Igraonica</p>
                    <p>Tajana Tenšek</p>
                    <p className="text-slate-400">091 112 4851</p>
                    <p className="mt-2 font-semibold text-slate-700">Ples / Pilates</p>
                    <p>Nikolina Huđin</p>
                    <p className="text-slate-400">099 239 5185</p>
                    <p className="mt-2 font-semibold text-slate-700">Plesni punktovi</p>
                    <p>Ivona Perkov-Kolenc</p>
                    <p className="text-slate-400">098 229 361</p>
                  </>
                )}
                {location === 'dvorana-2' && (
                  <>
                    <p className="font-semibold text-slate-700">Stolni tenis</p>
                    <p>Stipe Gale</p>
                    <p className="text-slate-400">098 670 513</p>
                    <p className="mt-2 font-semibold text-slate-700">BUSHIDO-judo</p>
                    <p>David Pikutić</p>
                    <p className="text-slate-400">091 193 0234</p>
                  </>
                )}
              </div>
            </div>

            {/* Admin panel link */}
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              <span>⚙</span> Admin panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
