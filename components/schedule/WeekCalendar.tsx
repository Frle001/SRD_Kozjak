'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityCard from './ActivityCard';
import type { ScheduleActivity } from '@/lib/mock-schedule';
import { HR_DAYS_SHORT } from '@/lib/mock-schedule';
import { fadeUp, staggerContainer } from '@/lib/animations';

const DAY_NAMES_FULL = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];

interface Props {
  weekDays: string[];   // 7 YYYY-MM-DD strings, Mon→Sun
  activities: ScheduleActivity[];
  focusedDate: string | null;
  today: string;
  onDayClick: (date: string) => void;
}

function formatDayHeader(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${d}.${m}.`;
}

export default function WeekCalendar({ weekDays, activities, focusedDate, today, onDayClick }: Props) {
  // On mobile: which day sections are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(weekDays.map((d) => [d, d === today]))
  );

  function toggleDay(date: string) {
    setExpanded((prev) => ({ ...prev, [date]: !prev[date] }));
  }

  const byDate = weekDays.reduce<Record<string, ScheduleActivity[]>>((acc, d) => {
    acc[d] = activities
      .filter((a) => a.date === d)
      .sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const daysToShow = focusedDate
    ? weekDays.filter((d) => d === focusedDate)
    : weekDays;

  return (
    <div>
      {/* ── Desktop week grid (md+) ─────────────────────── */}
      <motion.div
        className="hidden md:grid gap-2"
        style={{ gridTemplateColumns: `repeat(${daysToShow.length}, minmax(0, 1fr))` }}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {daysToShow.map((date, i) => {
          const dayIndex = weekDays.indexOf(date);
          const dayActivities = byDate[date] ?? [];
          const isToday = date === today;
          const isFocused = focusedDate === date;

          return (
            <motion.div key={date} variants={fadeUp} className="flex flex-col gap-2 min-h-48">
              {/* Column header */}
              <button
                onClick={() => onDayClick(date)}
                className={`rounded-xl px-2 py-2 text-center transition-all border ${
                  isToday
                    ? 'bg-green-500 text-white border-green-500 shadow-md'
                    : isFocused
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-[11px] font-semibold opacity-80">
                  {HR_DAYS_SHORT[dayIndex]}
                </div>
                <div className="text-base font-black leading-tight">{formatDayHeader(date)}</div>
                {dayActivities.length > 0 && (
                  <div className={`text-[10px] mt-0.5 font-medium ${isToday ? 'text-green-100' : 'text-slate-400'}`}>
                    {dayActivities.length} aktivn.
                  </div>
                )}
              </button>

              {/* Activity cards */}
              <div className="flex flex-col gap-1.5">
                {dayActivities.length === 0 ? (
                  <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-slate-200">
                    <span className="text-xs text-slate-300">–</span>
                  </div>
                ) : (
                  dayActivities.map((a) => (
                    <ActivityCard key={a.id} activity={a} compact />
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Mobile stacked day cards (< md) ─────────────── */}
      <div className="md:hidden space-y-3">
        {daysToShow.map((date, i) => {
          const dayIndex = weekDays.indexOf(date);
          const dayActivities = byDate[date] ?? [];
          const isToday = date === today;
          const isOpen = expanded[date] ?? false;

          return (
            <motion.div
              key={date}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Day header — tap to expand */}
              <button
                onClick={() => toggleDay(date)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left ${
                  isToday ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0 ${
                      isToday ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="text-[10px] font-semibold leading-none opacity-80">
                      {HR_DAYS_SHORT[dayIndex]}
                    </div>
                    <div className="text-base font-black leading-tight">
                      {parseInt(date.split('-')[2])}
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isToday ? 'text-green-700' : 'text-slate-900'}`}>
                      {DAY_NAMES_FULL[dayIndex]}
                      {isToday && <span className="ml-2 text-xs font-normal text-green-600">· danas</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {dayActivities.length === 0
                        ? 'Nema aktivnosti'
                        : `${dayActivities.filter(a => a.status !== 'otkazano').length} aktivn.`}
                    </p>
                  </div>
                </div>
                <span className={`text-slate-400 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {/* Expandable activity list */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2">
                      {dayActivities.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">Nema aktivnosti ovaj dan.</p>
                      ) : (
                        dayActivities.map((a) => (
                          <ActivityCard key={a.id} activity={a} />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
