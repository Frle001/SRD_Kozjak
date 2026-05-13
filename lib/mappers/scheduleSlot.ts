import type { DbScheduleSlot } from '@/types/database';
import type { ScheduleSlot } from '@/types/app';

export function mapScheduleSlot(row: DbScheduleSlot): ScheduleSlot {
  return {
    id: row.id,
    locationId: row.location_id,
    dayOfWeek: row.day_of_week,
    startHour: row.start_hour,
    endHour: row.end_hour,
    activityType: row.activity_type,
    status: row.status,
  };
}
