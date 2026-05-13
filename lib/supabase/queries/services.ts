import { createClient } from '@/lib/supabase/server';
import { SERVICES } from '@/lib/mock-data';
import { mapService } from '@/lib/mappers';
import type { Service } from '@/types/app';
import type { DbService } from '@/types/database';

/**
 * Fetch active services.
 * - When NEXT_PUBLIC_SUPABASE_URL is set: reads from Supabase `services` table.
 * - Otherwise: returns in-memory mock data (no env vars needed for development).
 */
export async function getServices(): Promise<Service[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return SERVICES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[getServices] Supabase error:', error.message);
      return SERVICES;
    }

    if (!data || data.length === 0) return SERVICES;

    return (data as DbService[]).map(mapService);
  } catch (err) {
    console.error('[getServices] Unexpected error:', err);
    return SERVICES;
  }
}
