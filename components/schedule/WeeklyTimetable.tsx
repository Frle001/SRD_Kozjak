'use client';

import Link from 'next/link';
import {
  LOCATION_CONFIG,
  ACTIVITY_CONFIG,
  HR_DAYS,
  HR_DAYS_SHORT,
  generateDayBlocks,
} from '@/lib/kozjak-schedule';
import type { Location, SlotStatus, DayBlock, ReservationBlock } from '@/lib/kozjak-schedule';

/** Format YYYY-MM-DD as 'D.M.' for compact column display. */
function fmtShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d)}.${parseInt(m)}.`;
}

/** Given weekStart (Monday) and 1-based dayOfWeek, return the date string. */
function weekDate(weekStart: string | undefined, dayOfWeek: number): string | null {
  if (!weekStart) return null;
  const base = new Date(`${weekStart}T12:00:00`);
  base.setDate(base.getDate() + (dayOfWeek - 1));
  return base.toISOString().split('T')[0];
}

const HOUR_HEIGHT = 56; // px per hour

function pad(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

// ─── Single slot block ────────────────────────────────────────────────────────

interface SlotProps {
  block: DayBlock;
  dimmed: boolean;
}

function SlotBlock({ block, dimmed }: SlotProps) {
  const h = (block.endHour - block.startHour) * HOUR_HEIGHT;
  const hours = block.endHour - block.startHour;

  if (block.kind === 'closed') {
    return (
      <div
        style={{ height: h }}
        className="bg-slate-100 flex items-center justify-center border-b border-slate-200/60 flex-shrink-0"
      >
        {hours >= 2 && (
          <span className="text-[10px] text-slate-300 font-medium select-none">Zatvoreno</span>
        )}
      </div>
    );
  }

  if (block.kind === 'free') {
    return (
      <div
        style={{ height: h }}
        className={`group flex flex-col items-center justify-center gap-1 border border-dashed border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all flex-shrink-0 px-1 ${
          dimmed ? 'opacity-25 pointer-events-none' : ''
        }`}
      >
        {hours >= 1 && (
          <>
            <span className="text-[10px] text-slate-300 group-hover:text-emerald-500 leading-none font-medium">
              {pad(block.startHour)}–{pad(block.endHour)}
            </span>
            {hours >= 2 && (
              <Link
                href="/rezervacija"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-emerald-500 text-white px-2 py-1 rounded-full whitespace-nowrap shadow-sm"
              >
                + Rezerviraj
              </Link>
            )}
          </>
        )}
      </div>
    );
  }

  // Reserved block (real user booking from Supabase)
  if (block.kind === 'reserved') {
    const res = block.reservation!;
    const isPending = res.slotStatus === 'ceka-potvrdu';
    return (
      <div
        style={{ height: h }}
        className={`border-l-4 px-2 py-1.5 overflow-hidden flex flex-col gap-0.5 flex-shrink-0 transition-opacity ${
          isPending
            ? 'border-amber-400 bg-amber-50'
            : 'border-blue-400 bg-blue-50'
        } ${dimmed ? 'opacity-25' : ''}`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-sm leading-none flex-shrink-0">📋</span>
          <span className={`text-[11px] font-bold leading-tight truncate ${isPending ? 'text-amber-800' : 'text-blue-800'}`}>
            {res.serviceName}
          </span>
        </div>
        {hours >= 1 && (
          <span className={`text-[10px] font-semibold leading-none ${isPending ? 'text-amber-600' : 'text-blue-600'}`}>
            {isPending ? 'Čeka potvrdu' : 'Rezervirano'}
          </span>
        )}
      </div>
    );
  }

  // Activity block (recurring schedule)
  const cfg = ACTIVITY_CONFIG[block.entry!.activityType];
  return (
    <div
      style={{ height: h }}
      className={`border-l-4 ${cfg.accentBorder} ${cfg.lightBg} px-2 py-1.5 overflow-hidden flex flex-col gap-0.5 flex-shrink-0 transition-opacity ${
        dimmed ? 'opacity-25' : ''
      }`}
    >
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-sm leading-none flex-shrink-0">{cfg.emoji}</span>
        <span className={`text-[11px] font-bold ${cfg.text} leading-tight truncate`}>
          {cfg.name}
        </span>
      </div>
      {hours >= 2 && (
        <span className="text-[10px] text-slate-500 leading-none">
          {pad(block.startHour)}–{pad(block.endHour)}
        </span>
      )}
      {hours >= 2 && (
        <span className="text-[10px] text-slate-400 font-medium leading-none">↻ Tjedni raspored</span>
      )}
    </div>
  );
}

// ─── Mobile day card ──────────────────────────────────────────────────────────

function MobileDayCard({
  location,
  dayOfWeek,
  activeStatuses,
  reservations,
  dateLabel,
}: {
  location: Location;
  dayOfWeek: number;
  activeStatuses: SlotStatus[];
  reservations: ReservationBlock[];
  dateLabel: string | null;
}) {
  const blocks = generateDayBlocks(location, dayOfWeek, reservations);
  const visible = blocks.filter((b) => {
    if (activeStatuses.length === 0) return true;
    if (b.kind === 'closed') return false;
    if (b.kind === 'free') return activeStatuses.includes('slobodno');
    if (b.kind === 'reserved') return activeStatuses.includes(b.reservation!.slotStatus);
    return activeStatuses.includes(b.entry!.status);
  });

  if (visible.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
        <span className="font-bold text-sm">{HR_DAYS[dayOfWeek - 1]}</span>
        {dateLabel && (
          <span className="text-xs text-slate-400">{dateLabel}</span>
        )}
      </div>
      <div className="p-3 space-y-2">
        {visible.map((block, i) => {
          if (block.kind === 'closed') return null;
          if (block.kind === 'free') {
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Slobodan termin</p>
                  <p className="text-sm font-bold text-slate-700">
                    {pad(block.startHour)} – {pad(block.endHour)}
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      ({block.endHour - block.startHour}h)
                    </span>
                  </p>
                </div>
                <Link
                  href="/rezervacija"
                  className="text-[11px] font-bold bg-emerald-500 text-white px-3 py-2 rounded-full whitespace-nowrap shadow-sm hover:bg-emerald-600 transition-colors min-h-[36px] flex items-center"
                >
                  Rezerviraj
                </Link>
              </div>
            );
          }
          if (block.kind === 'reserved') {
            const res = block.reservation!;
            const isPending = res.slotStatus === 'ceka-potvrdu';
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 ${
                  isPending ? 'bg-amber-50 border-amber-400' : 'bg-blue-50 border-blue-400'
                }`}
              >
                <span className="text-xl flex-shrink-0">📋</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isPending ? 'text-amber-800' : 'text-blue-800'}`}>
                    {res.serviceName}
                  </p>
                  <p className={`text-xs ${isPending ? 'text-amber-600' : 'text-blue-600'}`}>
                    {pad(block.startHour)} – {pad(block.endHour)} · {isPending ? 'Čeka potvrdu' : 'Rezervirano'}
                  </p>
                </div>
              </div>
            );
          }
          const cfg = ACTIVITY_CONFIG[block.entry!.activityType];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl ${cfg.lightBg} border-l-4 ${cfg.accentBorder} px-3 py-2.5`}
            >
              <span className="text-xl flex-shrink-0">{cfg.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${cfg.text} truncate`}>{cfg.name}</p>
                <p className="text-xs text-slate-500">
                  {pad(block.startHour)} – {pad(block.endHour)} · ↻ Tjedni raspored
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main timetable ───────────────────────────────────────────────────────────

interface Props {
  location: Location;
  activeDays: number[];
  activeStatuses: SlotStatus[];
  dayReservations?: Map<number, ReservationBlock[]>;
  weekStart?: string;
}

export default function WeeklyTimetable({
  location,
  activeDays,
  activeStatuses,
  dayReservations,
  weekStart,
}: Props) {
  const cfg = LOCATION_CONFIG[location];
  const [dispStart, dispEnd] = cfg.displayRange;
  const totalHours = dispEnd - dispStart;
  const totalHeight = totalHours * HOUR_HEIGHT;

  const allDays = [1, 2, 3, 4, 5, 6, 7];
  const daysToShow = activeDays.length > 0 ? allDays.filter((d) => activeDays.includes(d)) : allDays;

  function isDimmed(block: DayBlock): boolean {
    if (activeStatuses.length === 0) return false;
    if (block.kind === 'closed') return false;
    if (block.kind === 'free') return !activeStatuses.includes('slobodno');
    if (block.kind === 'reserved') return !activeStatuses.includes(block.reservation!.slotStatus);
    return !activeStatuses.includes(block.entry!.status);
  }

  return (
    <>
      {/* ── Desktop timetable (md+) ───────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="flex border-b border-slate-200 bg-slate-800 rounded-t-2xl">
          <div className="w-14 flex-shrink-0 border-r border-slate-700" />
          {daysToShow.map((d) => {
            const date = weekDate(weekStart, d);
            return (
              <div
                key={d}
                className="flex-1 min-w-[80px] text-center py-3 border-r border-slate-700 last:border-r-0"
              >
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">
                  {HR_DAYS[d - 1]}
                </div>
                <div className="text-xs font-bold text-white lg:hidden">
                  {HR_DAYS_SHORT[d - 1]}
                </div>
                {date && (
                  <div className="text-[10px] text-slate-500 mt-0.5">{fmtShort(date)}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="flex" style={{ height: totalHeight }}>
          {/* Time axis */}
          <div className="w-14 flex-shrink-0 border-r border-slate-100 relative bg-slate-50">
            {Array.from({ length: totalHours }, (_, i) => (
              <div
                key={i}
                style={{ height: HOUR_HEIGHT }}
                className="flex items-start justify-end pr-2 pt-1 border-b border-slate-100"
              >
                <span className="text-[10px] text-slate-400 font-medium leading-none tabular-nums">
                  {pad(dispStart + i)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {daysToShow.map((d) => {
            const res = dayReservations?.get(d) ?? [];
            const blocks = generateDayBlocks(location, d, res);
            return (
              <div
                key={d}
                className="flex-1 min-w-[80px] flex flex-col border-r border-slate-100 last:border-r-0"
              >
                {blocks.map((block, i) => (
                  <SlotBlock key={i} block={block} dimmed={isDimmed(block)} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile day cards (< md) ───────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {daysToShow.map((d) => {
          const date = weekDate(weekStart, d);
          return (
            <MobileDayCard
              key={d}
              location={location}
              dayOfWeek={d}
              activeStatuses={activeStatuses}
              reservations={dayReservations?.get(d) ?? []}
              dateLabel={date ? fmtShort(date) : null}
            />
          );
        })}
      </div>
    </>
  );
}
