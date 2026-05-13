/**
 * Frontend / app-layer types — camelCase, UI-oriented.
 *
 * These are what React components work with. DB rows are mapped to these
 * shapes in lib/mappers/ before reaching any component.
 */

export type ServiceId =
  | 'mali-nogomet'
  | 'stolni-tenis'
  | 'rodendani'
  | 'treninzi'
  | 'caffe-bar';

export type ReservationStatus = 'novo' | 'potvrđeno' | 'plaćeno' | 'otkazano';

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  duration: number;    // minutes
  priceFrom: number;   // EUR
  emoji: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

export interface Reservation {
  id: string;          // 'KOZ-XXXXX'
  serviceId: ServiceId;
  serviceName: string;
  date: string;        // 'YYYY-MM-DD'
  time: string;        // 'HH:MM'
  name: string;
  phone: string;
  note: string;
  status: ReservationStatus;
  createdAt: string;   // ISO 8601
}

export interface ScheduleSlot {
  id: string;
  locationId: string;
  dayOfWeek: number;   // 1=Mon … 7=Sun
  startHour: number;
  endHour: number;
  activityType: string;
  status: string;
}
