// ─── Types ────────────────────────────────────────────────────────────────────

export type Location = 'teren' | 'dvorana-1' | 'dvorana-2';

export type ActivityType =
  | 'ns'           // ŠRD KOZJAK-NŠ (Nogometna škola)
  | 'termini'      // Termini za građane
  | 'igraonica'    // ŠRD KOZJAK-igraonica
  | 'ples'         // ŠRD KOZJAK-ples
  | 'pilates'      // ŠRD KOZJAK-pilates
  | 'plesni'       // Plesni punktovi
  | 'stolni-tenis' // ŠRD KOZJAK-stolni tenis
  | 'judo';        // BUSHIDO-judo

export type SlotStatus = 'zauzeto' | 'slobodno' | 'rezervirano' | 'ceka-potvrdu';

export interface RecurringEntry {
  id: string;
  location: Location;
  dayOfWeek: number; // 1=Mon … 7=Sun
  startHour: number;
  endHour: number;
  activityType: ActivityType;
  status: SlotStatus;
}

export interface DayBlock {
  startHour: number;
  endHour: number;
  kind: 'activity' | 'free' | 'closed';
  entry?: RecurringEntry;
}

// ─── Activity display config ──────────────────────────────────────────────────

export const ACTIVITY_CONFIG: Record<
  ActivityType,
  { name: string; emoji: string; bg: string; text: string; lightBg: string; accentBorder: string; pill: string }
> = {
  ns: {
    name: 'ŠRD KOZJAK-NŠ',
    emoji: '⚽',
    bg: 'bg-green-500',
    text: 'text-green-800',
    lightBg: 'bg-green-50',
    accentBorder: 'border-green-500',
    pill: 'bg-green-100 text-green-700',
  },
  termini: {
    name: 'Termini za građane',
    emoji: '🏃',
    bg: 'bg-sky-500',
    text: 'text-sky-800',
    lightBg: 'bg-sky-50',
    accentBorder: 'border-sky-500',
    pill: 'bg-sky-100 text-sky-700',
  },
  igraonica: {
    name: 'ŠRD KOZJAK-igraonica',
    emoji: '🧸',
    bg: 'bg-amber-400',
    text: 'text-amber-800',
    lightBg: 'bg-amber-50',
    accentBorder: 'border-amber-400',
    pill: 'bg-amber-100 text-amber-700',
  },
  ples: {
    name: 'ŠRD KOZJAK-ples',
    emoji: '💃',
    bg: 'bg-pink-500',
    text: 'text-pink-800',
    lightBg: 'bg-pink-50',
    accentBorder: 'border-pink-500',
    pill: 'bg-pink-100 text-pink-700',
  },
  pilates: {
    name: 'ŠRD KOZJAK-pilates',
    emoji: '🧘',
    bg: 'bg-purple-500',
    text: 'text-purple-800',
    lightBg: 'bg-purple-50',
    accentBorder: 'border-purple-500',
    pill: 'bg-purple-100 text-purple-700',
  },
  plesni: {
    name: 'Plesni punktovi',
    emoji: '🎵',
    bg: 'bg-rose-500',
    text: 'text-rose-800',
    lightBg: 'bg-rose-50',
    accentBorder: 'border-rose-500',
    pill: 'bg-rose-100 text-rose-700',
  },
  'stolni-tenis': {
    name: 'ŠRD KOZJAK-stolni tenis',
    emoji: '🏓',
    bg: 'bg-blue-500',
    text: 'text-blue-800',
    lightBg: 'bg-blue-50',
    accentBorder: 'border-blue-500',
    pill: 'bg-blue-100 text-blue-700',
  },
  judo: {
    name: 'BUSHIDO-judo',
    emoji: '🥋',
    bg: 'bg-orange-600',
    text: 'text-orange-800',
    lightBg: 'bg-orange-50',
    accentBorder: 'border-orange-600',
    pill: 'bg-orange-100 text-orange-700',
  },
};

// ─── Location config ──────────────────────────────────────────────────────────

export interface LocationConfig {
  label: string;
  shortLabel: string;
  emoji: string;
  /** Visible hour range in the timetable grid */
  displayRange: [number, number];
  /** When the facility actually accepts bookings */
  operatingHours: { weekday: [number, number]; weekend: [number, number] };
}

export const LOCATION_CONFIG: Record<Location, LocationConfig> = {
  teren: {
    label: 'Malonogometni teren',
    shortLabel: 'Teren',
    emoji: '⚽',
    displayRange: [9, 22],
    operatingHours: { weekday: [9, 22], weekend: [9, 22] },
  },
  'dvorana-1': {
    label: 'Dvorana 1',
    shortLabel: 'Dvorana 1',
    emoji: '🎭',
    displayRange: [10, 22],
    operatingHours: { weekday: [16, 22], weekend: [10, 22] },
  },
  'dvorana-2': {
    label: 'Dvorana 2',
    shortLabel: 'Dvorana 2',
    emoji: '🏓',
    displayRange: [10, 22],
    operatingHours: { weekday: [16, 22], weekend: [10, 22] },
  },
};

// ─── Croatian labels ──────────────────────────────────────────────────────────

export const HR_DAYS      = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];
export const HR_DAYS_SHORT = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

export const STATUS_LABELS: Record<SlotStatus, string> = {
  zauzeto:       'Zauzeto',
  slobodno:      'Slobodno',
  rezervirano:   'Rezervirano',
  'ceka-potvrdu': 'Čeka potvrdu',
};

// ─── Recurring schedule — directly from PDF ───────────────────────────────────
//
// Source: "PREGLED korisnika termina malonogometnog terena na SRC KOZJAK"
//         "PREGLED korisnika dvorana na SRC KOZJAK"
//
// Digitalizirano iz postojećeg rasporeda termina.

export const RECURRING_SCHEDULE: RecurringEntry[] = [
  // ── Malonogometni teren ───────────────────────────────────────────────────
  // Ponedjeljak
  { id: 't-mon-ns',  location: 'teren', dayOfWeek: 1, startHour: 16, endHour: 20, activityType: 'ns',      status: 'zauzeto' },
  { id: 't-mon-tg',  location: 'teren', dayOfWeek: 1, startHour: 20, endHour: 22, activityType: 'termini', status: 'zauzeto' },
  // Utorak
  { id: 't-tue-ns',  location: 'teren', dayOfWeek: 2, startHour: 16, endHour: 21, activityType: 'ns',      status: 'zauzeto' },
  { id: 't-tue-tg',  location: 'teren', dayOfWeek: 2, startHour: 21, endHour: 22, activityType: 'termini', status: 'zauzeto' },
  // Srijeda
  { id: 't-wed-ns',  location: 'teren', dayOfWeek: 3, startHour: 16, endHour: 20, activityType: 'ns',      status: 'zauzeto' },
  { id: 't-wed-tg',  location: 'teren', dayOfWeek: 3, startHour: 20, endHour: 22, activityType: 'termini', status: 'zauzeto' },
  // Četvrtak
  { id: 't-thu-ns',  location: 'teren', dayOfWeek: 4, startHour: 16, endHour: 21, activityType: 'ns',      status: 'zauzeto' },
  { id: 't-thu-tg',  location: 'teren', dayOfWeek: 4, startHour: 21, endHour: 22, activityType: 'termini', status: 'zauzeto' },
  // Petak
  { id: 't-fri-ns',  location: 'teren', dayOfWeek: 5, startHour: 16, endHour: 21, activityType: 'ns',      status: 'zauzeto' },
  { id: 't-fri-tg',  location: 'teren', dayOfWeek: 5, startHour: 21, endHour: 22, activityType: 'termini', status: 'zauzeto' },
  // Subota
  { id: 't-sat-tg1', location: 'teren', dayOfWeek: 6, startHour: 10, endHour: 11, activityType: 'termini', status: 'zauzeto' },
  { id: 't-sat-ns',  location: 'teren', dayOfWeek: 6, startHour: 11, endHour: 14, activityType: 'ns',      status: 'zauzeto' },
  { id: 't-sat-tg2', location: 'teren', dayOfWeek: 6, startHour: 18, endHour: 19, activityType: 'termini', status: 'zauzeto' },
  // Nedjelja
  { id: 't-sun-ns',  location: 'teren', dayOfWeek: 7, startHour: 13, endHour: 16, activityType: 'ns',      status: 'zauzeto' },

  // ── Dvorana 1 ─────────────────────────────────────────────────────────────
  // Ponedjeljak
  { id: 'd1-mon-ig', location: 'dvorana-1', dayOfWeek: 1, startHour: 17, endHour: 19, activityType: 'igraonica', status: 'zauzeto' },
  { id: 'd1-mon-pl', location: 'dvorana-1', dayOfWeek: 1, startHour: 19, endHour: 21, activityType: 'ples',      status: 'zauzeto' },
  // Utorak
  { id: 'd1-tue-pl', location: 'dvorana-1', dayOfWeek: 2, startHour: 17, endHour: 19, activityType: 'ples',      status: 'zauzeto' },
  { id: 'd1-tue-pi', location: 'dvorana-1', dayOfWeek: 2, startHour: 19, endHour: 21, activityType: 'pilates',   status: 'zauzeto' },
  { id: 'd1-tue-pp', location: 'dvorana-1', dayOfWeek: 2, startHour: 21, endHour: 22, activityType: 'plesni',    status: 'zauzeto' },
  // Srijeda
  { id: 'd1-wed-ig', location: 'dvorana-1', dayOfWeek: 3, startHour: 17, endHour: 19, activityType: 'igraonica', status: 'zauzeto' },
  { id: 'd1-wed-pl', location: 'dvorana-1', dayOfWeek: 3, startHour: 19, endHour: 21, activityType: 'ples',      status: 'zauzeto' },
  // Četvrtak
  { id: 'd1-thu-pl', location: 'dvorana-1', dayOfWeek: 4, startHour: 17, endHour: 19, activityType: 'ples',      status: 'zauzeto' },
  { id: 'd1-thu-pi', location: 'dvorana-1', dayOfWeek: 4, startHour: 19, endHour: 21, activityType: 'pilates',   status: 'zauzeto' },
  // Petak
  { id: 'd1-fri-ig', location: 'dvorana-1', dayOfWeek: 5, startHour: 17, endHour: 19, activityType: 'igraonica', status: 'zauzeto' },
  { id: 'd1-fri-pp', location: 'dvorana-1', dayOfWeek: 5, startHour: 19, endHour: 22, activityType: 'plesni',    status: 'zauzeto' },
  // Subota
  { id: 'd1-sat-pp', location: 'dvorana-1', dayOfWeek: 6, startHour: 10, endHour: 12, activityType: 'plesni',    status: 'zauzeto' },
  // Nedjelja — nema aktivnosti

  // ── Dvorana 2 ─────────────────────────────────────────────────────────────
  // Ponedjeljak
  { id: 'd2-mon-st', location: 'dvorana-2', dayOfWeek: 1, startHour: 17, endHour: 22, activityType: 'stolni-tenis', status: 'zauzeto' },
  // Utorak
  { id: 'd2-tue-ju', location: 'dvorana-2', dayOfWeek: 2, startHour: 18, endHour: 22, activityType: 'judo',         status: 'zauzeto' },
  // Srijeda
  { id: 'd2-wed-st', location: 'dvorana-2', dayOfWeek: 3, startHour: 17, endHour: 22, activityType: 'stolni-tenis', status: 'zauzeto' },
  // Četvrtak
  { id: 'd2-thu-ju', location: 'dvorana-2', dayOfWeek: 4, startHour: 18, endHour: 22, activityType: 'judo',         status: 'zauzeto' },
  // Petak
  { id: 'd2-fri-st', location: 'dvorana-2', dayOfWeek: 5, startHour: 17, endHour: 22, activityType: 'stolni-tenis', status: 'zauzeto' },
  // Subota — nema aktivnosti
  // Nedjelja
  { id: 'd2-sun-st', location: 'dvorana-2', dayOfWeek: 7, startHour: 10, endHour: 12, activityType: 'stolni-tenis', status: 'zauzeto' },
];

// ─── Block generator ──────────────────────────────────────────────────────────

/** Returns an ordered list of blocks (activity, free, closed) covering the full display range */
export function generateDayBlocks(location: Location, dayOfWeek: number): DayBlock[] {
  const cfg = LOCATION_CONFIG[location];
  const isWeekend = dayOfWeek >= 6;
  const [opStart, opEnd] = isWeekend ? cfg.operatingHours.weekend : cfg.operatingHours.weekday;
  const [dispStart, dispEnd] = cfg.displayRange;

  const entries = RECURRING_SCHEDULE
    .filter((e) => e.location === location && e.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startHour - b.startHour);

  const blocks: DayBlock[] = [];

  // Pre-operating closed zone
  if (dispStart < opStart) {
    blocks.push({ startHour: dispStart, endHour: opStart, kind: 'closed' });
  }

  let cur = opStart;
  for (const e of entries) {
    if (e.startHour > cur) {
      blocks.push({ startHour: cur, endHour: e.startHour, kind: 'free' });
    }
    blocks.push({ startHour: e.startHour, endHour: e.endHour, kind: 'activity', entry: e });
    cur = e.endHour;
  }
  if (cur < opEnd) {
    blocks.push({ startHour: cur, endHour: opEnd, kind: 'free' });
  }

  // Post-operating closed zone
  if (opEnd < dispEnd) {
    blocks.push({ startHour: opEnd, endHour: dispEnd, kind: 'closed' });
  }

  return blocks;
}

/** Count free hours for a given location and day */
export function countFreeHours(location: Location, dayOfWeek: number): number {
  return generateDayBlocks(location, dayOfWeek)
    .filter((b) => b.kind === 'free')
    .reduce((sum, b) => sum + b.endHour - b.startHour, 0);
}
