import type { DbService } from '@/types/database';
import type { Service } from '@/types/app';

export function mapService(row: DbService): Service {
  return {
    id: row.id as Service['id'],
    name: row.name,
    description: row.description ?? '',
    duration: row.duration_minutes,
    priceFrom: Number(row.price_from_eur),
    emoji: row.emoji ?? '📋',
    colorClass: row.color_class ?? 'text-slate-600',
    borderClass: row.border_class ?? 'border-slate-400',
    bgClass: row.bg_class ?? 'bg-slate-50',
  };
}
