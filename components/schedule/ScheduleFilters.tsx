'use client';

import { HR_DAYS_SHORT, STATUS_LABELS } from '@/lib/kozjak-schedule';
import type { SlotStatus } from '@/lib/kozjak-schedule';

const ALL_STATUSES: SlotStatus[] = ['zauzeto', 'slobodno', 'rezervirano', 'ceka-potvrdu'];

const STATUS_COLORS: Record<SlotStatus, string> = {
  zauzeto:        'bg-slate-700 text-slate-100',
  slobodno:       'bg-emerald-600 text-white',
  rezervirano:    'bg-blue-600 text-white',
  'ceka-potvrdu': 'bg-amber-500 text-white',
};

const STATUS_ACTIVE: Record<SlotStatus, string> = {
  zauzeto:        'ring-2 ring-slate-500',
  slobodno:       'ring-2 ring-emerald-400',
  rezervirano:    'ring-2 ring-blue-400',
  'ceka-potvrdu': 'ring-2 ring-amber-400',
};

interface Props {
  activeDays: number[];
  onDayToggle: (d: number) => void;
  activeStatuses: SlotStatus[];
  onStatusToggle: (s: SlotStatus) => void;
  onReset: () => void;
}

export default function ScheduleFilters({
  activeDays,
  onDayToggle,
  activeStatuses,
  onStatusToggle,
  onReset,
}: Props) {
  const hasFilters = activeDays.length > 0 || activeStatuses.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 space-y-3">
      {/* Row 1: Day filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest w-16 flex-shrink-0">
          Dan
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {HR_DAYS_SHORT.map((label, i) => {
            const d = i + 1;
            const isActive = activeDays.includes(d);
            return (
              <button
                key={d}
                onClick={() => onDayToggle(d)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all min-h-[36px] ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Row 2: Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest w-16 flex-shrink-0">
          Status
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_STATUSES.map((s) => {
            const isActive = activeStatuses.includes(s);
            return (
              <button
                key={s}
                onClick={() => onStatusToggle(s)}
                className={`text-[11px] font-semibold px-3 py-2 rounded-lg transition-all min-h-[36px] ${
                  STATUS_COLORS[s]
                } ${isActive ? STATUS_ACTIVE[s] : 'opacity-40 hover:opacity-70'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors whitespace-nowrap px-2 py-2 min-h-[36px]"
          >
            Resetiraj filtere ×
          </button>
        )}
      </div>
    </div>
  );
}
