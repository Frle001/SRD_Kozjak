import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 },
    );
  }
}
