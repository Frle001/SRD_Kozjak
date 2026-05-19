-- =============================================================================
-- Migration 002 — Production-safe Row Level Security policies
-- =============================================================================
-- Replaces all alpha RLS policies with minimal-permission production policies.
--
-- Permission matrix:
--
--   Table            │ anon (public)          │ authenticated (admin)
--   ─────────────────┼────────────────────────┼──────────────────────────────
--   services         │ SELECT active only      │ SELECT/INSERT/UPDATE/DELETE
--   locations        │ SELECT all              │ SELECT/INSERT/UPDATE/DELETE
--   schedule_slots   │ SELECT all              │ SELECT/INSERT/UPDATE/DELETE
--   reservations     │ SELECT, INSERT (novo)   │ SELECT/UPDATE/DELETE
--   profiles         │ —                       │ self SELECT/UPDATE only
--
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times (all DROP IF EXISTS).
-- =============================================================================

-- ─── Drop every legacy policy ─────────────────────────────────────────────────
-- Dropping by name so re-runs are idempotent.

-- services
DROP POLICY IF EXISTS "services_public_read"         ON public.services;
DROP POLICY IF EXISTS "services_admin_write"         ON public.services;
DROP POLICY IF EXISTS "services_admin_select"        ON public.services;
DROP POLICY IF EXISTS "services_admin_insert"        ON public.services;
DROP POLICY IF EXISTS "services_admin_update"        ON public.services;
DROP POLICY IF EXISTS "services_admin_delete"        ON public.services;

-- locations
DROP POLICY IF EXISTS "locations_public_read"        ON public.locations;
DROP POLICY IF EXISTS "locations_admin_write"        ON public.locations;
DROP POLICY IF EXISTS "locations_admin_insert"       ON public.locations;
DROP POLICY IF EXISTS "locations_admin_update"       ON public.locations;
DROP POLICY IF EXISTS "locations_admin_delete"       ON public.locations;

-- schedule_slots
DROP POLICY IF EXISTS "schedule_slots_public_read"   ON public.schedule_slots;
DROP POLICY IF EXISTS "schedule_slots_admin_write"   ON public.schedule_slots;
DROP POLICY IF EXISTS "schedule_slots_admin_insert"  ON public.schedule_slots;
DROP POLICY IF EXISTS "schedule_slots_admin_update"  ON public.schedule_slots;
DROP POLICY IF EXISTS "schedule_slots_admin_delete"  ON public.schedule_slots;

-- reservations (covers names from both schema.sql and 001_reservations.sql)
DROP POLICY IF EXISTS "reservations_anon_insert"     ON public.reservations;
DROP POLICY IF EXISTS "reservations_public_read"     ON public.reservations;
DROP POLICY IF EXISTS "reservations_public_insert"   ON public.reservations;
DROP POLICY IF EXISTS "reservations_admin_all"       ON public.reservations;
DROP POLICY IF EXISTS "reservations_admin_select"    ON public.reservations;
DROP POLICY IF EXISTS "reservations_admin_update"    ON public.reservations;
DROP POLICY IF EXISTS "reservations_admin_delete"    ON public.reservations;

-- profiles
DROP POLICY IF EXISTS "profiles_self_read"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update"         ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"           ON public.profiles;


-- =============================================================================
-- SERVICES
-- =============================================================================

-- Public: booking form needs to list available services.
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT
  USING (active = true);

-- Admin: full control, including reading inactive (draft) services.
CREATE POLICY "services_admin_select" ON public.services
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "services_admin_insert" ON public.services
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "services_admin_update" ON public.services
  FOR UPDATE
  USING      (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "services_admin_delete" ON public.services
  FOR DELETE
  USING (auth.uid() IS NOT NULL);


-- =============================================================================
-- LOCATIONS
-- =============================================================================

-- Public: schedule page lists all locations.
CREATE POLICY "locations_public_read" ON public.locations
  FOR SELECT
  USING (true);

-- Admin: manage locations.
CREATE POLICY "locations_admin_insert" ON public.locations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "locations_admin_update" ON public.locations
  FOR UPDATE
  USING      (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "locations_admin_delete" ON public.locations
  FOR DELETE
  USING (auth.uid() IS NOT NULL);


-- =============================================================================
-- SCHEDULE SLOTS
-- =============================================================================

-- Public: recurring weekly schedule is entirely public.
CREATE POLICY "schedule_slots_public_read" ON public.schedule_slots
  FOR SELECT
  USING (true);

-- Admin: manage recurring schedule blocks.
CREATE POLICY "schedule_slots_admin_insert" ON public.schedule_slots
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "schedule_slots_admin_update" ON public.schedule_slots
  FOR UPDATE
  USING      (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "schedule_slots_admin_delete" ON public.schedule_slots
  FOR DELETE
  USING (auth.uid() IS NOT NULL);


-- =============================================================================
-- RESERVATIONS
-- =============================================================================

-- Public SELECT: needed so the server can check slot availability (start_time,
-- end_time, status) and render the public schedule page. Customer PII (name,
-- phone) is returned but is only processed server-side — it is never rendered
-- in the public UI. For full column-level PII protection, see the REVOKE block
-- at the bottom of this file.
CREATE POLICY "reservations_public_read" ON public.reservations
  FOR SELECT
  USING (true);

-- Public INSERT: customers may submit a booking. The WITH CHECK enforces that:
--   • status must be 'novo' — prevents self-approval or marking as paid
-- All other fields (service_id, date, time) are validated server-side in
-- submitReservationAction before the insert reaches the database.
CREATE POLICY "reservations_public_insert" ON public.reservations
  FOR INSERT
  WITH CHECK (status = 'novo');

-- Admin UPDATE: change status (novo → potvrđeno → plaćeno / otkazano).
-- The status CHECK constraint on the table enforces the allowed values.
CREATE POLICY "reservations_admin_update" ON public.reservations
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Admin DELETE: hard-delete a reservation (rare, but available in the dashboard).
CREATE POLICY "reservations_admin_delete" ON public.reservations
  FOR DELETE
  USING (auth.uid() IS NOT NULL);


-- =============================================================================
-- PROFILES
-- =============================================================================

-- Each admin user can only see and edit their own profile row.
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- =============================================================================
-- COLUMN-LEVEL PII PROTECTION — reservations
-- =============================================================================
-- The 'anon' role can query reservations for schedule/availability but must not
-- be able to read customer name, phone, or free-text notes.
--
-- This restricts direct REST/SDK queries made with the anon key. Server-side
-- code that uses the service-role key is unaffected (service role bypasses RLS
-- and column grants entirely).
--
-- After applying this, any SELECT that requests these columns with the anon key
-- will fail. The server actions that need these columns (admin dashboard, WhatsApp
-- notifications) all run with the service-role key, so they continue to work.
--
-- For the public availability check and schedule page the server actions only
-- need: id, service_id, reservation_date, start_time, end_time, status.
-- =============================================================================

REVOKE SELECT (customer_name, customer_phone, note)
  ON public.reservations
  FROM anon;

GRANT SELECT (customer_name, customer_phone, note)
  ON public.reservations
  TO authenticated;
