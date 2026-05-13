-- =============================================================================
-- ŠRD Kozjak Booking — Supabase Database Schema
-- =============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Or via CLI:  supabase db push
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── services ─────────────────────────────────────────────────────────────────
-- Rentable services offered by ŠRD Kozjak (football pitch, table tennis, etc.)

CREATE TABLE IF NOT EXISTS public.services (
  id               TEXT        PRIMARY KEY,           -- 'mali-nogomet', 'stolni-tenis', …
  name             TEXT        NOT NULL,
  description      TEXT,
  duration_minutes INTEGER     NOT NULL DEFAULT 60,
  price_from_eur   NUMERIC(10,2) NOT NULL DEFAULT 0,
  emoji            TEXT,
  color_class      TEXT,
  border_class     TEXT,
  bg_class         TEXT,
  active           BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anon users can read active services (needed for booking form)
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT USING (active = true);

-- Only authenticated admins can modify services
CREATE POLICY "services_admin_write" ON public.services
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── locations ────────────────────────────────────────────────────────────────
-- Physical spaces: Malonogometni teren, Dvorana 1, Dvorana 2

CREATE TABLE IF NOT EXISTS public.locations (
  id                      TEXT    PRIMARY KEY,  -- 'teren', 'dvorana-1', 'dvorana-2'
  label                   TEXT    NOT NULL,
  short_label             TEXT    NOT NULL,
  emoji                   TEXT,
  display_range_start     INTEGER NOT NULL,     -- first hour shown in timetable
  display_range_end       INTEGER NOT NULL,     -- last hour shown in timetable
  operating_weekday_start INTEGER NOT NULL,     -- earliest booking (Mon–Fri)
  operating_weekday_end   INTEGER NOT NULL,
  operating_weekend_start INTEGER NOT NULL,     -- earliest booking (Sat–Sun)
  operating_weekend_end   INTEGER NOT NULL
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_public_read" ON public.locations
  FOR SELECT USING (true);

CREATE POLICY "locations_admin_write" ON public.locations
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── schedule_slots ───────────────────────────────────────────────────────────
-- Recurring weekly blocks — direct digital copy of the PDF schedule.
-- Each row = one recurring time block for a location on a day of the week.

CREATE TABLE IF NOT EXISTS public.schedule_slots (
  id            TEXT        PRIMARY KEY,
  location_id   TEXT        NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  day_of_week   INTEGER     NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),  -- 1=Mon, 7=Sun
  start_hour    INTEGER     NOT NULL CHECK (start_hour >= 0 AND start_hour < 24),
  end_hour      INTEGER     NOT NULL CHECK (end_hour > start_hour AND end_hour <= 24),
  activity_type TEXT        NOT NULL,  -- 'ns', 'termini', 'igraonica', 'ples', 'pilates', 'plesni', 'stolni-tenis', 'judo'
  status        TEXT        NOT NULL DEFAULT 'zauzeto'
                            CHECK (status IN ('zauzeto', 'slobodno', 'rezervirano', 'ceka-potvrdu')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_slots_location_day ON public.schedule_slots (location_id, day_of_week);

ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_slots_public_read" ON public.schedule_slots
  FOR SELECT USING (true);

CREATE POLICY "schedule_slots_admin_write" ON public.schedule_slots
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── reservations ─────────────────────────────────────────────────────────────
-- Individual bookings submitted via the booking wizard.

CREATE TABLE IF NOT EXISTS public.reservations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       TEXT        NOT NULL REFERENCES public.services(id),
  reservation_date DATE        NOT NULL,
  start_time       TIME        NOT NULL,
  end_time         TIME        NOT NULL,
  customer_name    TEXT        NOT NULL,
  customer_phone   TEXT        NOT NULL,
  note             TEXT        NOT NULL DEFAULT '',
  status           TEXT        NOT NULL DEFAULT 'novo'
                   CHECK (status IN ('novo', 'potvrđeno', 'plaćeno', 'otkazano')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_date        ON public.reservations (reservation_date);
CREATE INDEX idx_reservations_status      ON public.reservations (status);
CREATE INDEX idx_reservations_created_at  ON public.reservations (created_at DESC);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anon users can insert (create a booking) and read their own reservation by id
CREATE POLICY "reservations_anon_insert" ON public.reservations
  FOR INSERT WITH CHECK (true);

-- Authenticated admins see everything
CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- One row per Supabase Auth user. Admin/staff roles for the dashboard.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'admin'
              CHECK (role IN ('admin', 'staff')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- SEED DATA — matches lib/mock-data.ts and lib/kozjak-schedule.ts
-- =============================================================================

-- ─── services ─────────────────────────────────────────────────────────────────

INSERT INTO public.services (id, name, description, duration_minutes, price_from_eur, emoji, color_class, border_class, bg_class)
VALUES
  ('mali-nogomet', 'Mali nogomet',
   'Iznajmljivanje zatvorenog terena za mali nogomet. Savršeno za rekreativce, firmaške turnire i amaterske ekipe.',
   60, 30, '⚽', 'text-green-600', 'border-green-500', 'bg-green-50'),
  ('stolni-tenis', 'Stolni tenis',
   'Profesionalni stolovi za stolni tenis dostupni za individualne, parove i grupne sesije svih razina.',
   60, 15, '🏓', 'text-blue-600', 'border-blue-500', 'bg-blue-50'),
  ('rodendani', 'Rođendani',
   'Nezaboravni dječji i odrasli rođendani u sportskom ambijentu. Animacija, catering i rekviziti po dogovoru.',
   180, 200, '🎂', 'text-rose-600', 'border-rose-500', 'bg-rose-50'),
  ('treninzi', 'Treninzi',
   'Individualni i grupni treninzi pod vodstvom licenciranih trenera. Prilagodba plana za sve uzraste.',
   90, 50, '💪', 'text-orange-600', 'border-orange-500', 'bg-orange-50'),
  ('caffe-bar', 'Caffe bar',
   'Rezervacija caffe bara za privatne proslave, poslovne susrete ili opušteno sijelo uz piće i zalogaje.',
   120, 0, '☕', 'text-amber-600', 'border-amber-500', 'bg-amber-50')
ON CONFLICT (id) DO NOTHING;

-- ─── locations ────────────────────────────────────────────────────────────────

INSERT INTO public.locations
  (id, label, short_label, emoji,
   display_range_start, display_range_end,
   operating_weekday_start, operating_weekday_end,
   operating_weekend_start, operating_weekend_end)
VALUES
  ('teren',     'Malonogometni teren', 'Teren',     '⚽', 9,  22, 9,  22, 9,  22),
  ('dvorana-1', 'Dvorana 1',           'Dvorana 1', '🎭', 10, 22, 16, 22, 10, 22),
  ('dvorana-2', 'Dvorana 2',           'Dvorana 2', '🏓', 10, 22, 16, 22, 10, 22)
ON CONFLICT (id) DO NOTHING;

-- ─── schedule_slots ───────────────────────────────────────────────────────────
-- Source: PREGLED korisnika termina malonogometnog terena na SRC KOZJAK
--         PREGLED korisnika dvorana na SRC KOZJAK
-- Digitalizirano iz postojećeg rasporeda termina.

INSERT INTO public.schedule_slots (id, location_id, day_of_week, start_hour, end_hour, activity_type, status)
VALUES
  -- Malonogometni teren
  ('t-mon-ns',  'teren', 1, 16, 20, 'ns',      'zauzeto'),
  ('t-mon-tg',  'teren', 1, 20, 22, 'termini', 'zauzeto'),
  ('t-tue-ns',  'teren', 2, 16, 21, 'ns',      'zauzeto'),
  ('t-tue-tg',  'teren', 2, 21, 22, 'termini', 'zauzeto'),
  ('t-wed-ns',  'teren', 3, 16, 20, 'ns',      'zauzeto'),
  ('t-wed-tg',  'teren', 3, 20, 22, 'termini', 'zauzeto'),
  ('t-thu-ns',  'teren', 4, 16, 21, 'ns',      'zauzeto'),
  ('t-thu-tg',  'teren', 4, 21, 22, 'termini', 'zauzeto'),
  ('t-fri-ns',  'teren', 5, 16, 21, 'ns',      'zauzeto'),
  ('t-fri-tg',  'teren', 5, 21, 22, 'termini', 'zauzeto'),
  ('t-sat-tg1', 'teren', 6, 10, 11, 'termini', 'zauzeto'),
  ('t-sat-ns',  'teren', 6, 11, 14, 'ns',      'zauzeto'),
  ('t-sat-tg2', 'teren', 6, 18, 19, 'termini', 'zauzeto'),
  ('t-sun-ns',  'teren', 7, 13, 16, 'ns',      'zauzeto'),

  -- Dvorana 1
  ('d1-mon-ig', 'dvorana-1', 1, 17, 19, 'igraonica', 'zauzeto'),
  ('d1-mon-pl', 'dvorana-1', 1, 19, 21, 'ples',      'zauzeto'),
  ('d1-tue-pl', 'dvorana-1', 2, 17, 19, 'ples',      'zauzeto'),
  ('d1-tue-pi', 'dvorana-1', 2, 19, 21, 'pilates',   'zauzeto'),
  ('d1-tue-pp', 'dvorana-1', 2, 21, 22, 'plesni',    'zauzeto'),
  ('d1-wed-ig', 'dvorana-1', 3, 17, 19, 'igraonica', 'zauzeto'),
  ('d1-wed-pl', 'dvorana-1', 3, 19, 21, 'ples',      'zauzeto'),
  ('d1-thu-pl', 'dvorana-1', 4, 17, 19, 'ples',      'zauzeto'),
  ('d1-thu-pi', 'dvorana-1', 4, 19, 21, 'pilates',   'zauzeto'),
  ('d1-fri-ig', 'dvorana-1', 5, 17, 19, 'igraonica', 'zauzeto'),
  ('d1-fri-pp', 'dvorana-1', 5, 19, 22, 'plesni',    'zauzeto'),
  ('d1-sat-pp', 'dvorana-1', 6, 10, 12, 'plesni',    'zauzeto'),

  -- Dvorana 2
  ('d2-mon-st', 'dvorana-2', 1, 17, 22, 'stolni-tenis', 'zauzeto'),
  ('d2-tue-ju', 'dvorana-2', 2, 18, 22, 'judo',         'zauzeto'),
  ('d2-wed-st', 'dvorana-2', 3, 17, 22, 'stolni-tenis', 'zauzeto'),
  ('d2-thu-ju', 'dvorana-2', 4, 18, 22, 'judo',         'zauzeto'),
  ('d2-fri-st', 'dvorana-2', 5, 17, 22, 'stolni-tenis', 'zauzeto'),
  ('d2-sun-st', 'dvorana-2', 7, 10, 12, 'stolni-tenis', 'zauzeto')
ON CONFLICT (id) DO NOTHING;

-- ─── reservations (sample data matching mock) ─────────────────────────────────

INSERT INTO public.reservations (service_id, reservation_date, start_time, end_time, customer_name, customer_phone, note, status, created_at)
VALUES
  ('mali-nogomet', '2026-05-11', '09:00', '10:00', 'Ivan Horvat',     '+385 91 234 5678', 'Trebamo 2 gola i pumpu za loptu', 'potvrđeno', '2026-05-09T10:00:00Z'),
  ('stolni-tenis', '2026-05-11', '14:00', '15:00', 'Marija Kovač',    '+385 95 876 5432', '', 'novo',      '2026-05-10T08:30:00Z'),
  ('treninzi',     '2026-05-11', '18:00', '19:30', 'Ante Perić',      '+385 98 111 2233', 'Grupni trening, juniori U15', 'plaćeno', '2026-05-08T15:45:00Z'),
  ('rodendani',    '2026-05-12', '11:00', '14:00', 'Petra Jurić',     '+385 91 555 6677', 'Dječji rođendan, 15 djece, torta u 13h', 'potvrđeno', '2026-05-07T12:00:00Z'),
  ('caffe-bar',    '2026-05-12', '17:00', '19:00', 'Tomislav Blažić', '+385 92 333 4455', 'Proslava godišnjice, oko 20 osoba', 'novo', '2026-05-10T16:20:00Z'),
  ('mali-nogomet', '2026-05-13', '10:00', '11:00', 'Josip Matić',     '+385 99 777 8899', '', 'otkazano', '2026-05-09T11:10:00Z'),
  ('stolni-tenis', '2026-05-14', '15:00', '16:00', 'Ana Novaković',   '+385 91 222 3344', 'Molim mirne stolove, ima malog', 'novo', '2026-05-10T09:00:00Z'),
  ('treninzi',     '2026-05-15', '08:00', '09:30', 'Luka Tomić',      '+385 98 444 5566', 'Individualni trening tenisa', 'potvrđeno', '2026-05-11T07:30:00Z'),
  ('mali-nogomet', '2026-05-15', '16:00', '17:00', 'Nikola Babić',    '+385 95 666 7788', '2×5 igrača, teren 2', 'plaćeno', '2026-05-11T08:00:00Z'),
  ('caffe-bar',    '2026-05-16', '19:00', '21:00', 'Katarina Šimić',  '+385 91 888 9900', 'Poslovni ručak, 8 osoba', 'novo', '2026-05-11T14:00:00Z'),
  ('rodendani',    '2026-05-17', '12:00', '15:00', 'Marin Vuković',   '+385 92 111 2200', 'Odrasli, 30 osoba, žele DJ', 'potvrđeno', '2026-05-10T11:00:00Z');
