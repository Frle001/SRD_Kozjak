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
