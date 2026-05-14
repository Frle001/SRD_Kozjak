/**
 * Server-only WhatsApp helpers via Twilio.
 *
 * Required env vars (never exposed to the client):
 *   TWILIO_ACCOUNT_SID     — Twilio account SID
 *   TWILIO_AUTH_TOKEN      — Twilio auth token
 *   TWILIO_WHATSAPP_FROM   — sender number, e.g. +14155238886 (sandbox) or your approved number
 *   ADMIN_WHATSAPP_TO      — admin's WhatsApp number to receive new-booking alerts, e.g. +385911234567
 *
 * All functions return WhatsAppResult. A failed send never throws — it returns
 * { sent: false, warning } so the caller can surface a non-blocking warning
 * without rolling back the reservation or status update.
 */

import twilio from 'twilio';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WhatsAppResult {
  sent: boolean;
  warning?: string;
}

export interface ReservationContext {
  bookingRef: string;    // display code, e.g. KOZ-A1B2C
  serviceName: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM
  customerName: string;
  customerPhone: string; // E.164 preferred, e.g. +385911234567
  note?: string;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

/** Build the Twilio client from env vars. Returns null when unconfigured. */
function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

/** Ensure a phone number has the `whatsapp:` scheme Twilio requires. */
function wa(phone: string): string {
  const e164 = phone.startsWith('+') ? phone : `+${phone}`;
  return `whatsapp:${e164}`;
}

/** Core send — never throws. Logs errors and returns a warning string on failure. */
async function send(to: string, body: string): Promise<WhatsAppResult> {
  const client = getClient();
  const from   = process.env.TWILIO_WHATSAPP_FROM;

  if (!client || !from) {
    console.warn(
      '[WhatsApp] Twilio unconfigured — TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM missing.',
    );
    return { sent: false, warning: 'WhatsApp nije konfiguriran (nedostaju Twilio env varijable).' };
  }

  try {
    const msg = await client.messages.create({ from: wa(from), to: wa(to), body });
    console.info('[WhatsApp] sent %s → %s', msg.sid, to);
    return { sent: true };
  } catch (err) {
    console.error('[WhatsApp] send failed to %s:', to, err);
    return { sent: false, warning: 'WhatsApp poruka nije mogla biti poslana.' };
  }
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Notify admin of a new customer reservation.
 * Sends to ADMIN_WHATSAPP_TO.
 */
export async function sendAdminNewReservationMessage(
  ctx: ReservationContext,
): Promise<WhatsAppResult> {
  const adminTo = process.env.ADMIN_WHATSAPP_TO;
  if (!adminTo) {
    console.warn('[WhatsApp] ADMIN_WHATSAPP_TO not set — admin notification skipped.');
    return { sent: false, warning: 'ADMIN_WHATSAPP_TO nije postavljen.' };
  }

  const noteStr = ctx.note ? `\nNapomena: ${ctx.note}` : '';
  const body =
    `🆕 *Nova rezervacija*\n\n` +
    `Ref: ${ctx.bookingRef}\n` +
    `Usluga: ${ctx.serviceName}\n` +
    `Datum: ${ctx.date} u ${ctx.time}\n` +
    `Ime: ${ctx.customerName}\n` +
    `Mobitel: ${ctx.customerPhone}` +
    noteStr;

  return send(adminTo, body);
}

/**
 * Confirm a reservation to the customer.
 * Call when status changes to "potvrđeno".
 */
export async function sendCustomerConfirmationMessage(
  ctx: Omit<ReservationContext, 'note'>,
): Promise<WhatsAppResult> {
  const body =
    `✅ *Rezervacija potvrđena!*\n\n` +
    `Ref: ${ctx.bookingRef}\n` +
    `Usluga: ${ctx.serviceName}\n` +
    `Datum: ${ctx.date} u ${ctx.time}\n\n` +
    `Vidimo se! 🏟️\n` +
    `— ŠRD Kozjak`;

  return send(ctx.customerPhone, body);
}

/**
 * Notify customer that their reservation was cancelled.
 * Call when status changes to "otkazano".
 */
export async function sendCustomerCancellationMessage(
  ctx: Omit<ReservationContext, 'note'>,
): Promise<WhatsAppResult> {
  const body =
    `❌ *Rezervacija otkazana*\n\n` +
    `Ref: ${ctx.bookingRef}\n` +
    `Usluga: ${ctx.serviceName}\n` +
    `Datum: ${ctx.date} u ${ctx.time}\n\n` +
    `Za više informacija nazovite nas.\n` +
    `— ŠRD Kozjak`;

  return send(ctx.customerPhone, body);
}
