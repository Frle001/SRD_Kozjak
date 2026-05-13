import { SERVICES } from '@/lib/mock-data';
import type { DbReservation } from '@/types/database';
import type { Reservation } from '@/types/app';

export function mapReservation(row: DbReservation): Reservation {
  return {
    id: row.id,
    serviceId: row.service_id as Reservation['serviceId'],
    // service_name is not stored in the DB — resolve from the services list.
    // Falls back to the raw service_id string if the service isn't found.
    serviceName: SERVICES.find((s) => s.id === row.service_id)?.name ?? row.service_id,
    date: row.reservation_date,
    time: row.start_time.slice(0, 5),   // 'HH:MM:SS' → 'HH:MM'
    name: row.customer_name,
    phone: row.customer_phone,
    note: row.note,
    status: row.status as Reservation['status'],
    createdAt: row.created_at,
  };
}
