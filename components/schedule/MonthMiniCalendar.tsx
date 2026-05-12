'use client';

import { motion } from 'framer-motion';
import {
  getMonthGrid,
  HR_MONTHS,
  HR_DAYS_SHORT,
  addDays,
} from '@/lib/mock-schedule';
import type { ScheduleActivity } from '@/lib/mock-schedule';

interface Props {
  year: number;
  month: number; // 0-indexed
  activities: ScheduleActivity[];
  selectedDate: string | null;
  today: string;
  onDateSelect: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

export default function MonthMiniCalendar({
  year,
  month,
  activities,
  selectedDate,
  today,
  onDateSelect,
  onMonthChange,
}: Props) {
  const cells = getMonthGrid(year, month);

  // Count activities per date (excluding otkazano)
  const countByDate = activities.reduce<Record<string, number>>((acc, a) => {
    if (a.status !== 'otkazano') {
      acc[a.date] = (acc[a.date] ?? 0) + 1;
    }
    return acc;
  }, {});

  function prevMonth() {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }
  function nextMonth() {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }

  // Dot color based on count
  function dotColor(count: number): string {
    if (count >= 4) return 'bg-rose-500';
    if (count >= 2) return 'bg-orange-400';
    return 'bg-green-500';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-sm"
        >
          ‹
        </button>
        <h3 className="text-sm font-bold text-slate-900">
          {HR_MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-sm"
        >
          ›
        </button>
      </div>

      {/* Day-name header */}
      <div className="grid grid-cols-7 mb-1">
        {HR_DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(({ date, inMonth }) => {
          const count = countByDate[date] ?? 0;
          const isToday = date === today;
          const isSelected = date === selectedDate;

          return (
            <motion.button
              key={date}
              whileTap={{ scale: 0.85 }}
              onClick={() => onDateSelect(date)}
              className={`relative flex flex-col items-center justify-center rounded-lg py-1 transition-all text-center ${
                isSelected
                  ? 'bg-green-500 text-white shadow-md'
                  : isToday
                  ? 'bg-green-100 text-green-700 font-bold'
                  : inMonth
                  ? 'hover:bg-slate-100 text-slate-700'
                  : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs leading-none">{parseInt(date.split('-')[2])}</span>
              {/* Activity dot */}
              {count > 0 && (
                <span
                  className={`mt-0.5 rounded-full ${isSelected ? 'bg-white/70' : dotColor(count)} ${
                    count >= 4 ? 'w-3 h-1.5' : 'w-1.5 h-1.5'
                  }`}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 flex-wrap">
        <span className="text-[10px] text-slate-400 font-medium">Aktivnosti:</span>
        {[
          { color: 'bg-green-500', label: '1' },
          { color: 'bg-orange-400', label: '2–3' },
          { color: 'bg-rose-500 w-3 h-1.5', label: '4+' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Week navigation hint */}
      {selectedDate && (
        <div className="mt-2 text-[10px] text-slate-400 text-center">
          Klik na isti datum za prikaz cijelog tjedna
        </div>
      )}
    </div>
  );
}
