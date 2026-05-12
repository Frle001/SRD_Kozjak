import type { ServiceId, ReservationStatus } from './mock-data';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScheduleActivity {
  id: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  endTime: string;     // HH:MM
  serviceId: ServiceId;
  serviceName: string;
  contactName: string;
  status: ReservationStatus;
  note: string;
  isRecurring?: boolean;
}

// ─── Service display config ───────────────────────────────────────────────────

export const SCHEDULE_SERVICE: Record<ServiceId, {
  emoji: string;
  label: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  lightBg: string;
}> = {
  'mali-nogomet': {
    emoji: '⚽',
    label: 'Mali nogomet',
    borderClass: 'border-green-500',
    bgClass: 'bg-green-500',
    textClass: 'text-green-700',
    lightBg: 'bg-green-50',
  },
  'stolni-tenis': {
    emoji: '🏓',
    label: 'Stolni tenis',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-700',
    lightBg: 'bg-blue-50',
  },
  rodendani: {
    emoji: '🎂',
    label: 'Rođendan',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-700',
    lightBg: 'bg-rose-50',
  },
  treninzi: {
    emoji: '💪',
    label: 'Trening',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-700',
    lightBg: 'bg-orange-50',
  },
  'caffe-bar': {
    emoji: '☕',
    label: 'Caffe / Event',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    lightBg: 'bg-amber-50',
  },
};

// ─── Date utilities ───────────────────────────────────────────────────────────

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function getDaysOfWeek(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function getWeeksBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T12:00:00');
  const d2 = new Date(date2 + 'T12:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 7));
}

export function formatWeekRange(weekStart: string): string {
  const weekEnd = addDays(weekStart, 6);
  const [sy, sm, sd] = weekStart.split('-').map(Number);
  const [, em, ed] = weekEnd.split('-').map(Number);
  const months = [
    'siječnja','veljače','ožujka','travnja','svibnja','lipnja',
    'srpnja','kolovoza','rujna','listopada','studenog','prosinca',
  ];
  if (sm === em) {
    return `${sd}. – ${ed}. ${months[sm - 1]} ${sy}.`;
  }
  return `${sd}. ${months[sm - 1]} – ${ed}. ${months[em - 1]} ${sy}.`;
}

export function getMonthGrid(year: number, month: number): Array<{ date: string; inMonth: boolean }> {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysFromMonday = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; inMonth: boolean }> = [];

  for (let i = daysFromMonday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d.toISOString().split('T')[0], inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      inMonth: true,
    });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nd = new Date(year, month + 1, d);
    cells.push({ date: nd.toISOString().split('T')[0], inMonth: false });
  }
  return cells;
}

export const HR_MONTHS = [
  'Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj',
  'Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac',
];
export const HR_DAYS_SHORT = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

// ─── Mock data ────────────────────────────────────────────────────────────────

/** Compute endTime from HH:MM start + duration in minutes */
function et(start: string, minutes: number): string {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const MOCK_SCHEDULE: ScheduleActivity[] = [
  // ── Prev week: 2026-05-04 – 2026-05-10 ──────────────────────────────────
  { id: 'S001', date: '2026-05-04', time: '09:00', endTime: et('09:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U12',      status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S002', date: '2026-05-04', time: '18:00', endTime: et('18:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Rekreativna liga', status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S003', date: '2026-05-05', time: '08:00', endTime: et('08:00', 60),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Marko Šimić',      status: 'plaćeno',   note: 'Individualni trening' },
  { id: 'S004', date: '2026-05-05', time: '15:00', endTime: et('15:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'FK Kozjak',        status: 'potvrđeno', note: '' },
  { id: 'S005', date: '2026-05-06', time: '14:00', endTime: et('14:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U15',      status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S006', date: '2026-05-06', time: '19:00', endTime: et('19:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Privatni event',   status: 'novo',      note: '' },
  { id: 'S007', date: '2026-05-07', time: '10:00', endTime: et('10:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Slobodna igra',    status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S008', date: '2026-05-07', time: '17:00', endTime: et('17:00', 90),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Firmijada',        status: 'otkazano',  note: 'Otkazano - nedovoljan broj igrača' },
  { id: 'S009', date: '2026-05-08', time: '09:00', endTime: et('09:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Jutarnji krug',    status: 'plaćeno',   note: '', isRecurring: true },
  { id: 'S010', date: '2026-05-08', time: '11:00', endTime: et('11:00', 60),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Luka Babić',       status: 'plaćeno',   note: '' },
  { id: 'S011', date: '2026-05-08', time: '20:00', endTime: et('20:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Privatni event',   status: 'potvrđeno', note: '20 osoba' },
  { id: 'S012', date: '2026-05-09', time: '10:00', endTime: et('10:00', 120), serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Subotni turnir',   status: 'plaćeno',   note: '8 ekipa', isRecurring: true },
  { id: 'S013', date: '2026-05-09', time: '13:00', endTime: et('13:00', 180), serviceId: 'rodendani',    serviceName: 'Rođendan',     contactName: 'Ivana Perić',      status: 'potvrđeno', note: 'Dječji, 18 djece' },
  { id: 'S014', date: '2026-05-09', time: '17:00', endTime: et('17:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Obiteljski',       status: 'potvrđeno', note: '' },
  { id: 'S015', date: '2026-05-10', time: '11:00', endTime: et('11:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Nedjeljna rekreacija', status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S016', date: '2026-05-10', time: '14:00', endTime: et('14:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Slobodna igra',    status: 'novo',      note: '' },

  // ── Current week: 2026-05-11 – 2026-05-17 ───────────────────────────────
  { id: 'S017', date: '2026-05-11', time: '09:00', endTime: et('09:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U12',      status: 'potvrđeno', note: 'Taktički trening', isRecurring: true },
  { id: 'S018', date: '2026-05-11', time: '11:00', endTime: et('11:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Ana Kovač',        status: 'novo',      note: '' },
  { id: 'S019', date: '2026-05-11', time: '18:00', endTime: et('18:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Rekreativna liga', status: 'potvrđeno', note: '5v5', isRecurring: true },

  { id: 'S020', date: '2026-05-12', time: '08:00', endTime: et('08:00', 60),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Marko Šimić',      status: 'plaćeno',   note: 'Kondicionalni trening' },
  { id: 'S021', date: '2026-05-12', time: '10:00', endTime: et('10:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Petra Novak',      status: 'novo',      note: '' },
  { id: 'S022', date: '2026-05-12', time: '15:00', endTime: et('15:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'FK Kozjak',        status: 'potvrđeno', note: 'Trening utakmica' },
  { id: 'S023', date: '2026-05-12', time: '20:00', endTime: et('20:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Maturansko sijelo', status: 'novo',     note: '30 osoba' },

  { id: 'S024', date: '2026-05-13', time: '09:00', endTime: et('09:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Tomislav Blažić',  status: 'potvrđeno', note: '' },
  { id: 'S025', date: '2026-05-13', time: '14:00', endTime: et('14:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U15',      status: 'potvrđeno', note: 'Tehnika', isRecurring: true },
  { id: 'S026', date: '2026-05-13', time: '17:00', endTime: et('17:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Rekreativci',      status: 'potvrđeno', note: '' },

  { id: 'S027', date: '2026-05-14', time: '10:00', endTime: et('10:00', 90),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Firmijada',        status: 'novo',      note: '4 ekipe, finale' },
  { id: 'S028', date: '2026-05-14', time: '15:00', endTime: et('15:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Ana Horvat',       status: 'plaćeno',   note: '' },
  { id: 'S029', date: '2026-05-14', time: '18:00', endTime: et('18:00', 60),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Kata Petrić',      status: 'novo',      note: 'Individualni' },

  { id: 'S030', date: '2026-05-15', time: '09:00', endTime: et('09:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Jutarnji krug',    status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S031', date: '2026-05-15', time: '11:00', endTime: et('11:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Grupni trening',   status: 'plaćeno',   note: '8 polaznika' },
  { id: 'S032', date: '2026-05-15', time: '16:00', endTime: et('16:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Josip Marić',      status: 'potvrđeno', note: '' },
  { id: 'S033', date: '2026-05-15', time: '19:00', endTime: et('19:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Poslovni ručak',   status: 'novo',      note: '10 osoba' },

  { id: 'S034', date: '2026-05-16', time: '10:00', endTime: et('10:00', 180), serviceId: 'rodendani',    serviceName: 'Rođendan',     contactName: 'Petra Jurić',      status: 'potvrđeno', note: 'Dječji, 15 djece, torta' },
  { id: 'S035', date: '2026-05-16', time: '13:00', endTime: et('13:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'NK Amatori',       status: 'plaćeno',   note: '' },
  { id: 'S036', date: '2026-05-16', time: '15:00', endTime: et('15:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Ivan Marić',       status: 'novo',      note: '' },
  { id: 'S037', date: '2026-05-16', time: '17:00', endTime: et('17:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U12',      status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S038', date: '2026-05-16', time: '20:00', endTime: et('20:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Proslava mature',  status: 'novo',      note: '25 osoba, DJ' },

  { id: 'S039', date: '2026-05-17', time: '09:00', endTime: et('09:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Rekreativci',      status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S040', date: '2026-05-17', time: '11:00', endTime: et('11:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Obiteljski turnir', status: 'plaćeno',  note: '' },
  { id: 'S041', date: '2026-05-17', time: '14:00', endTime: et('14:00', 180), serviceId: 'rodendani',    serviceName: 'Rođendan',     contactName: 'Marin Vuković',    status: 'potvrđeno', note: 'Odrasli, 30 osoba' },
  { id: 'S042', date: '2026-05-17', time: '18:00', endTime: et('18:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Privatni event',   status: 'plaćeno',   note: '' },

  // ── Next week: 2026-05-18 – 2026-05-24 ──────────────────────────────────
  { id: 'S043', date: '2026-05-18', time: '09:00', endTime: et('09:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U12',      status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S044', date: '2026-05-18', time: '18:00', endTime: et('18:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Rekreativna liga', status: 'novo',      note: '', isRecurring: true },
  { id: 'S045', date: '2026-05-19', time: '08:00', endTime: et('08:00', 60),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Marko Šimić',      status: 'potvrđeno', note: '' },
  { id: 'S046', date: '2026-05-19', time: '14:00', endTime: et('14:00', 90),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'NK Split (prijatelj.)', status: 'novo', note: 'Prijateljska utakmica' },
  { id: 'S047', date: '2026-05-20', time: '14:00', endTime: et('14:00', 90),  serviceId: 'treninzi',     serviceName: 'Treninzi',     contactName: 'Juniori U15',      status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S048', date: '2026-05-20', time: '17:00', endTime: et('17:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Slobodna igra',    status: 'novo',      note: '' },
  { id: 'S049', date: '2026-05-21', time: '10:00', endTime: et('10:00', 90),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Firmijada 2',      status: 'novo',      note: '' },
  { id: 'S050', date: '2026-05-21', time: '16:00', endTime: et('16:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Tatjana Kovač',    status: 'potvrđeno', note: '' },
  { id: 'S051', date: '2026-05-22', time: '09:00', endTime: et('09:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Jutarnji krug',    status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S052', date: '2026-05-22', time: '19:00', endTime: et('19:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Godišnjica',       status: 'potvrđeno', note: '15 osoba' },
  { id: 'S053', date: '2026-05-23', time: '10:00', endTime: et('10:00', 120), serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Subotni turnir',   status: 'novo',      note: '', isRecurring: true },
  { id: 'S054', date: '2026-05-23', time: '13:00', endTime: et('13:00', 180), serviceId: 'rodendani',    serviceName: 'Rođendan',     contactName: 'Klara Babić',      status: 'potvrđeno', note: 'Dječji, 20 djece' },
  { id: 'S055', date: '2026-05-23', time: '17:00', endTime: et('17:00', 60),  serviceId: 'stolni-tenis', serviceName: 'Stolni tenis', contactName: 'Turnir parova',    status: 'plaćeno',   note: '' },
  { id: 'S056', date: '2026-05-24', time: '11:00', endTime: et('11:00', 60),  serviceId: 'mali-nogomet', serviceName: 'Mali nogomet', contactName: 'Nedjeljna rekreacija', status: 'potvrđeno', note: '', isRecurring: true },
  { id: 'S057', date: '2026-05-24', time: '14:00', endTime: et('14:00', 120), serviceId: 'caffe-bar',    serviceName: 'Caffe bar',    contactName: 'Obiteljski event', status: 'novo',      note: '' },
];

// ─── Price lookup (for revenue estimate) ─────────────────────────────────────

export const SERVICE_PRICE: Record<ServiceId, number> = {
  'mali-nogomet': 30,
  'stolni-tenis': 15,
  rodendani: 200,
  treninzi: 50,
  'caffe-bar': 0,
};
