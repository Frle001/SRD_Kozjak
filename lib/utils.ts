import type { Service, Reservation } from '@/types/app';

export function formatDateHr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${parseInt(day)}.${parseInt(month)}.${year}.`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function generateBookingId(): string {
  return 'KOZ-' + Date.now().toString(36).toUpperCase().slice(-5);
}

export function buildWhatsAppLink(
  reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>,
  bookingId: string
): string {
  const message = [
    'Poštovani,',
    'želio/željela bih potvrditi svoju rezervaciju:',
    '',
    `📍 Usluga: ${reservation.serviceName}`,
    `📅 Datum: ${formatDateHr(reservation.date)}`,
    `⏰ Vrijeme: ${reservation.time}`,
    `👤 Ime: ${reservation.name}`,
    `📞 Telefon: ${reservation.phone}`,
    reservation.note ? `📝 Napomena: ${reservation.note}` : '',
    '',
    `🔖 ID rezervacije: ${bookingId}`,
    '',
    'Hvala!',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `https://wa.me/385910000000?text=${encodeURIComponent(message)}`;
}

export function getStatusLabel(status: Reservation['status']): string {
  const map: Record<Reservation['status'], string> = {
    novo: 'Novo',
    'potvrđeno': 'Potvrđeno',
    'plaćeno': 'Plaćeno',
    otkazano: 'Otkazano',
  };
  return map[status];
}

export function getStatusColors(status: Reservation['status']): string {
  const map: Record<Reservation['status'], string> = {
    novo: 'bg-blue-100 text-blue-700',
    'potvrđeno': 'bg-green-100 text-green-700',
    'plaćeno': 'bg-emerald-100 text-emerald-700',
    otkazano: 'bg-red-100 text-red-700',
  };
  return map[status];
}

export function getServiceById(
  services: Service[],
  id: string
): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekEndStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}
