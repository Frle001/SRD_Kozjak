import { NextResponse } from 'next/server';
import { sendAdminNewReservationMessage } from '@/lib/whatsapp/twilio';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await sendAdminNewReservationMessage({
    bookingRef:    'KOZ-TEST1',
    serviceName:   'Mali nogomet',
    date:          '2026-05-14',
    time:          '18:00',
    customerName:  'Test Korisnik',
    customerPhone: process.env.ADMIN_WHATSAPP_TO ?? 'N/A',
    note:          'Ovo je testna poruka — možeš je ignorirati.',
  });

  if (result.sent) {
    return NextResponse.json({ ok: true, message: 'WhatsApp testna poruka poslana.' });
  }

  return NextResponse.json(
    { ok: false, warning: result.warning ?? 'Nepoznata greška.' },
    { status: 500 },
  );
}
