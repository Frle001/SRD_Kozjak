import type { ScheduleActivity } from '@/lib/mock-schedule';
import { SCHEDULE_SERVICE } from '@/lib/mock-schedule';

const STATUS_STYLES = {
  potvrđeno: 'bg-green-100 text-green-700',
  plaćeno:   'bg-emerald-100 text-emerald-700',
  novo:      'bg-blue-100 text-blue-700',
  otkazano:  'bg-red-100 text-red-700',
} as const;

const STATUS_LABELS = {
  potvrđeno: 'Potvrđeno',
  plaćeno:   'Plaćeno',
  novo:      'Čeka potvrdu',
  otkazano:  'Otkazano',
} as const;

interface Props {
  activity: ScheduleActivity;
  /** Compact = inside a week-view column; full = mobile / day-list */
  compact?: boolean;
}

export default function ActivityCard({ activity, compact = false }: Props) {
  const svc = SCHEDULE_SERVICE[activity.serviceId];
  const isDimmed = activity.status === 'otkazano';

  if (compact) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden border-l-4 ${svc.borderClass} ${svc.lightBg} px-3 py-2 text-left transition-all hover:shadow-md ${isDimmed ? 'opacity-50' : ''}`}
      >
        {activity.isRecurring && (
          <span className="absolute top-1.5 right-1.5 text-slate-300 text-[10px]">↻</span>
        )}
        <p className="text-[11px] font-semibold text-slate-500 leading-none mb-1">
          {activity.time} – {activity.endTime}
        </p>
        <p className={`text-xs font-bold leading-snug ${svc.textClass}`}>
          {svc.emoji} {activity.serviceName}
        </p>
        {activity.contactName && (
          <p className="text-[11px] text-slate-600 mt-0.5 truncate">{activity.contactName}</p>
        )}
        <span className={`inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLES[activity.status]}`}>
          {STATUS_LABELS[activity.status]}
        </span>
      </div>
    );
  }

  // Full / mobile card
  return (
    <div
      className={`flex gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${isDimmed ? 'opacity-50' : ''}`}
    >
      {/* Left color stripe */}
      <div className={`w-1.5 flex-shrink-0 ${svc.bgClass}`} />

      <div className="flex-1 min-w-0 py-3 pr-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${svc.lightBg}`}>
              {svc.emoji}
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-bold leading-tight ${svc.textClass}`}>
                {activity.serviceName}
              </p>
              {activity.contactName && (
                <p className="text-xs text-slate-500 leading-tight truncate">{activity.contactName}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[activity.status]}`}>
              {STATUS_LABELS[activity.status]}
            </span>
            {activity.isRecurring && (
              <span className="text-[10px] text-slate-400">↻ Ponavljajuće</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>⏰ {activity.time} – {activity.endTime}</span>
          {activity.note && (
            <span className="truncate text-slate-400">· {activity.note}</span>
          )}
        </div>
      </div>
    </div>
  );
}
