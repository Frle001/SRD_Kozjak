# ŠRD Kozjak — Booking App

Demo aplikacija za online rezervacije termina u Športsko-rekreacijskom društvu Kozjak.

## Tech stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- Mock podaci (nema pravog backenda)

## Pokretanje

```bash
npm install
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u pregledniku.

## Stranice

| URL | Opis |
|-----|------|
| `/` | Landing stranica s hero sekcijom, uslugama i CTA |
| `/rezervacija` | Wizard za rezervaciju (4 koraka) |
| `/rezervacija?usluga=mali-nogomet` | Rezervacija s predodabranom uslugom |
| `/admin` | Admin panel s tablom rezervacija i filtrima |

## Struktura projekta

```
app/
├── layout.tsx          # Root layout (Navbar + Footer)
├── page.tsx            # Landing stranica
├── globals.css         # Globalni stilovi + Tailwind import
├── rezervacija/
│   └── page.tsx        # Stranica za rezervaciju
└── admin/
    └── page.tsx        # Admin panel

components/
├── Navbar.tsx
├── Footer.tsx
├── landing/
│   ├── HeroSection.tsx
│   ├── ServicesSection.tsx
│   └── CtaSection.tsx
├── booking/
│   └── BookingFlow.tsx  # Višekoračni wizard (client component)
└── admin/
    └── AdminDashboard.tsx  # Dashboard s filterima (client component)

lib/
├── mock-data.ts        # Tipovi + mock podaci
└── utils.ts            # Pomoćne funkcije
```

## Usluge

- ⚽ Mali nogomet
- 🏓 Stolni tenis
- 🎂 Rođendani
- 💪 Treninzi
- ☕ Caffe bar

## Tok rezervacije

1. **Odaberi uslugu** — kartica s opisom i cijenom
2. **Odaberi datum i vrijeme** — date picker + grid slobodnih termina
3. **Unesi podatke** — ime, telefon, napomena
4. **Potvrda** — sažetak rezervacije + WhatsApp link za potvrdu

## Admin panel

- Statistike (danas, tjedan, čeka potvrdu, nenaplaćeno)
- Filtriranje po usluzi, statusu, datumu i pretraživanju
- Promjena statusa: Novo → Potvrđeno → Plaćeno / Otkazano
- Responzivno: kartice na mobitelu, tablica na desktopu

## Napomena

Aplikacija koristi lokalne mock podatke. Sve promjene statusa u admin panelu su privremene (in-memory) i resetiraju se pri refresh stranice. Za produkciju bi se dodao backend (baza podataka + API rute) i autentifikacija.

---

## Supabase setup

### 1. Kreiraj projekt

1. Idi na [supabase.com](https://supabase.com) i kreiraj novi projekt.
2. Preporučena regija: **eu-central-1 (Frankfurt)**.

### 2. Postavi env varijable

```bash
cp .env.local.example .env.local
```

Popuni vrijednostima iz **Supabase Dashboard → Project Settings → API**:

| Varijabla | Gdje je naći |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` ključ |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` ključ — samo server-side, nikad ne commitaj |

### 3. Pokreni schema

U **Supabase Dashboard → SQL Editor** pokreni sadržaj [`supabase/schema.sql`](supabase/schema.sql).

Kreira tablice:

| Tablica | Opis |
|---|---|
| `services` | Usluge (teren, stolni tenis, rođendani, …) |
| `locations` | Prostori (Teren, Dvorana 1, Dvorana 2) |
| `schedule_slots` | Ponavljajući tjedni blokovi — digitalizirano iz PDF rasporeda |
| `reservations` | Individualne rezervacije iz booking wizarda |
| `profiles` | Admin / staff korisnici (vezani na Supabase Auth) |

Seed podaci koji odgovaraju mock podacima su uključeni — sigurno za pokretanje više puta (`ON CONFLICT DO NOTHING`).

### 4. (Opcionalno) Generiraj TypeScript tipove

```bash
npx supabase gen types typescript --project-id <tvoj-project-id> \
  > lib/supabase/types.ts
```

### 5. Klijentski moduli

| Datoteka | Upotreba |
|---|---|
| `lib/supabase/client.ts` | Browser klijent — za `'use client'` komponente |
| `lib/supabase/server.ts` | Server klijent — za Server Components i Route Handlers |
| `lib/supabase/types.ts` | DB tipovi (zamijeni generiranim kad povežeš projekt) |

### Row Level Security

Sve tablice imaju uključen RLS:
- **Anon** korisnici mogu čitati usluge, lokacije i raspored + kreirati rezervacije.
- **Authenticated** korisnici (admini) imaju puni pristup svim tablicama.
- `profiles` su vidljivi i promjenjivi samo vlastitom korisniku.
