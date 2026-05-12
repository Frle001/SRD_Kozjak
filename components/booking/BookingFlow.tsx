'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES, TIME_SLOTS, UNAVAILABLE_SLOTS } from '@/lib/mock-data';
import type { Reservation, Service } from '@/lib/mock-data';
import {
  formatDateHr,
  formatDuration,
  generateBookingId,
  buildWhatsAppLink,
  getTodayStr,
} from '@/lib/utils';
import { useReservations } from '@/components/ReservationProvider';
import { scaleIn, staggerContainer, fadeUp } from '@/lib/animations';

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Usluga', 'Datum & Vrijeme', 'Podaci', 'Potvrda'];

function priceLabel(service: Service): string {
  if (service.priceFrom === 0) return 'Po dogovoru';
  return `od ${service.priceFrom} €`;
}

/* ────────────────────────────────────────────────────────────
   Step indicator
   ────────────────────────────────────────────────────────────*/
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = current > step;
        const active = current === step;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-green-600 text-white ring-4 ring-green-100'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {done ? '✓' : step}
              </div>
              <span
                className={`mt-1.5 text-xs hidden sm:block ${
                  active ? 'text-green-600 font-semibold' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-1 mb-4 transition-all ${
                  done ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Selection summary strip (steps 2–3)
   ────────────────────────────────────────────────────────────*/
function SelectionStrip({
  service,
  date,
  time,
}: {
  service: Service;
  date: string;
  time: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${service.bgClass}`}
      >
        {service.emoji}
      </div>

      <div className="flex-1 min-w-0 text-sm">
        <span className="font-semibold text-slate-900">{service.name}</span>
        {date && (
          <span className="text-slate-400 mx-1.5">·</span>
        )}
        {date && (
          <span className="text-slate-600">{formatDateHr(date)}</span>
        )}
        {time && (
          <>
            <span className="text-slate-400 mx-1.5">·</span>
            <span className="font-semibold text-slate-800">{time}</span>
          </>
        )}
      </div>

      <div className="flex-shrink-0 text-right">
        <span className={`text-sm font-bold ${service.colorClass}`}>
          {priceLabel(service)}
        </span>
        <div className="text-xs text-slate-400">procjena</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Step 1 — Service selection
   ────────────────────────────────────────────────────────────*/
function ServiceStep({
  selected,
  onSelect,
}: {
  selected: Service | null;
  onSelect: (s: Service) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Odaberi uslugu</h2>
      <p className="text-slate-500 text-sm mb-6">
        Klikni na uslugu koju želiš rezervirati.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map((service) => {
          const isSelected = selected?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${service.bgClass}`}
                >
                  {service.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {service.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400">
                      ⏱ {formatDuration(service.duration)}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${service.bgClass} ${service.colorClass}`}
                    >
                      {priceLabel(service)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Step 2 — Date & time
   ────────────────────────────────────────────────────────────*/
function DateTimeStep({
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  date: string;
  time: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
}) {
  const today = getTodayStr();
  const unavailable = date ? (UNAVAILABLE_SLOTS[date] ?? []) : [];
  const freeCount = TIME_SLOTS.length - unavailable.length;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Odaberi datum i vrijeme
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Zeleni termini su slobodni, sivi su zauzeti.
      </p>

      {/* Date picker */}
      <div className="mb-6">
        <label
          htmlFor="date"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Datum
        </label>
        <input
          id="date"
          type="date"
          min={today}
          value={date}
          onChange={(e) => {
            onDateChange(e.target.value);
            onTimeChange('');
          }}
          className="w-full sm:w-64 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-green-500 transition-colors text-sm"
        />
      </div>

      {/* Time slots */}
      {date && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">
              Slobodni termini — {formatDateHr(date)}
            </p>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {freeCount} slobodnih
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {TIME_SLOTS.map((slot) => {
              const taken = unavailable.includes(slot);
              const selected = time === slot;
              return (
                <button
                  key={slot}
                  disabled={taken}
                  onClick={() => onTimeChange(slot)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    taken
                      ? 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                      : selected
                      ? 'border-green-500 bg-green-500 text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-green-400 hover:text-green-700'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            ℹ️ Termini su prikazani u lokalnom vremenu (GMT+2)
          </p>
        </div>
      )}

      {!date && (
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-400 text-sm">
            Odaberi datum da vidiš slobodne termine
          </p>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Step 3 — Contact details
   ────────────────────────────────────────────────────────────*/
function DetailsStep({
  name,
  phone,
  note,
  service,
  date,
  time,
  onChange,
}: {
  name: string;
  phone: string;
  note: string;
  service: Service;
  date: string;
  time: string;
  onChange: (field: 'name' | 'phone' | 'note', value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Tvoji podaci</h2>
      <p className="text-slate-500 text-sm mb-6">
        Unesite kontakt podatke za potvrdu rezervacije.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Ime i prezime <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="npr. Ivan Horvat"
            autoComplete="name"
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Broj mobitela <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+385 91 000 0000"
            autoComplete="tel"
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">
            Koristit ćemo ga za WhatsApp potvrdu rezervacije.
          </p>
        </div>

        <div>
          <label
            htmlFor="note"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Napomena{' '}
            <span className="text-slate-400 font-normal">(neobavezno)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => onChange('note', e.target.value)}
            placeholder="npr. broj igrača, posebni zahtjevi..."
            rows={3}
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors text-sm resize-none"
          />
        </div>
      </div>

      {/* Order summary */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Sažetak narudžbe
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Usluga</span>
            <span className="font-medium text-slate-900">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Datum</span>
            <span className="font-medium text-slate-900">{formatDateHr(date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Vrijeme</span>
            <span className="font-medium text-slate-900">{time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Trajanje</span>
            <span className="font-medium text-slate-900">{formatDuration(service.duration)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-slate-700">Procjena cijene</span>
            <span className={`font-bold ${service.colorClass}`}>
              {priceLabel(service)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        🔒 Vaši podaci koriste se isključivo za potvrdu rezervacije i neće biti
        dijeljeni s trećim stranama.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Step 4 — Confirmation screen
   ────────────────────────────────────────────────────────────*/
function ConfirmationStep({
  service,
  date,
  time,
  name,
  phone,
  note,
  bookingId,
  onNewBooking,
}: {
  service: Service;
  date: string;
  time: string;
  name: string;
  phone: string;
  note: string;
  bookingId: string;
  onNewBooking: () => void;
}) {
  const whatsappLink = buildWhatsAppLink(
    {
      serviceId: service.id,
      serviceName: service.name,
      date,
      time,
      name,
      phone,
      note,
    },
    bookingId
  );

  return (
    <motion.div
      className="text-center"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Success icon — spring scale */}
      <motion.div
        variants={scaleIn}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg shadow-green-100"
      >
        ✅
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-2xl font-black text-slate-900 mb-1">
        Rezervacija zaprimljena!
      </motion.h2>
      <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-8">
        Vaša rezervacija je kreirana i čeka potvrdu od strane centra.
        Pošaljite nam WhatsApp poruku za brzu potvrdu.
      </motion.p>

      {/* Booking summary */}
      <motion.div variants={fadeUp} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Detalji rezervacije
          </span>
          <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
            {bookingId}
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: service.emoji, label: 'Usluga', value: service.name },
            { icon: '📅', label: 'Datum', value: formatDateHr(date) },
            { icon: '⏰', label: 'Vrijeme', value: time },
            { icon: '⏱', label: 'Trajanje', value: formatDuration(service.duration) },
            { icon: '👤', label: 'Ime', value: name },
            { icon: '📞', label: 'Telefon', value: phone },
            ...(note ? [{ icon: '📝', label: 'Napomena', value: note }] : []),
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-base w-5 flex-shrink-0">{icon}</span>
              <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
              </div>
            </div>
          ))}

          {/* Price estimate */}
          <div className="border-t border-slate-200 pt-2.5 mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              💶 Procjena cijene
            </span>
            <span className={`text-sm font-bold ${service.colorClass}`}>
              {priceLabel(service)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Status pill */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Status: čeka potvrdu
        </span>
      </motion.div>

      {/* WhatsApp CTA */}
      <motion.a
        variants={fadeUp}
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5 mb-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Pošalji potvrdu na WhatsApp
      </motion.a>

      {/* Admin demo link */}
      <motion.div variants={fadeUp}>
        <Link
          href="/admin"
          className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-2xl text-sm transition-colors mb-2"
        >
          <span>🖥️</span>
          Pogledaj rezervaciju u admin panelu
          <span className="text-slate-400">→</span>
        </Link>
      </motion.div>

      <motion.button
        variants={fadeUp}
        onClick={onNewBooking}
        className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        ← Napravi novu rezervaciju
      </motion.button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main — BookingFlow
   ────────────────────────────────────────────────────────────*/
export default function BookingFlow({
  initialServiceId,
}: {
  initialServiceId?: string;
}) {
  const { addReservation } = useReservations();

  const [step, setStep] = useState<Step>(1);
  const dirRef = useRef<1 | -1>(1); // 1 = forward, -1 = back
  const [selectedService, setSelectedService] = useState<Service | null>(
    () => SERVICES.find((s) => s.id === initialServiceId) ?? null
  );
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (initialServiceId && SERVICES.find((s) => s.id === initialServiceId)) {
      setStep(2);
    }
  }, [initialServiceId]);

  function handleServiceSelect(service: Service) {
    setSelectedService(service);
  }

  function handleNext() {
    dirRef.current = 1;
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  function handleBack() {
    dirRef.current = -1;
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function handleSubmit() {
    if (!selectedService) return;
    dirRef.current = 1;

    const id = generateBookingId();
    const newReservation: Reservation = {
      id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date,
      time,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
      status: 'novo',
      createdAt: new Date().toISOString(),
    };

    addReservation(newReservation);
    setBookingId(id);
    setStep(4);
  }

  function handleNewBooking() {
    dirRef.current = -1;
    setStep(1);
    setSelectedService(null);
    setDate('');
    setTime('');
    setName('');
    setPhone('');
    setNote('');
    setBookingId('');
  }

  function canProceed(): boolean {
    if (step === 1) return selectedService !== null;
    if (step === 2) return date !== '' && time !== '';
    if (step === 3) return name.trim() !== '' && phone.trim() !== '';
    return false;
  }

  // Slide variants using current direction
  const slideVariants = {
    enter: { opacity: 0, x: dirRef.current * 32 },
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
    exit: {
      opacity: 0,
      x: dirRef.current * -24,
      transition: { duration: 0.2, ease: 'easeIn' as const },
    },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {step < 4 && <StepIndicator current={step} />}

      {/* Selection summary strip */}
      <AnimatePresence>
        {step >= 2 && step < 4 && selectedService && (
          <motion.div
            key="strip"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          >
            <SelectionStrip service={selectedService} date={date} time={time} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="p-6 sm:p-8"
          >
            {step === 1 && (
              <ServiceStep
                selected={selectedService}
                onSelect={handleServiceSelect}
              />
            )}
            {step === 2 && (
              <DateTimeStep
                date={date}
                time={time}
                onDateChange={setDate}
                onTimeChange={setTime}
              />
            )}
            {step === 3 && selectedService && (
              <DetailsStep
                name={name}
                phone={phone}
                note={note}
                service={selectedService}
                date={date}
                time={time}
                onChange={(field, value) => {
                  if (field === 'name') setName(value);
                  if (field === 'phone') setPhone(value);
                  if (field === 'note') setNote(value);
                }}
              />
            )}
            {step === 4 && bookingId && selectedService && (
              <ConfirmationStep
                service={selectedService}
                date={date}
                time={time}
                name={name}
                phone={phone}
                note={note}
                bookingId={bookingId}
                onNewBooking={handleNewBooking}
              />
            )}

            {/* Navigation */}
            {step < 4 && (
              <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    ← Natrag
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                  >
                    ← Početna
                  </Link>
                )}

                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                      canProceed()
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Dalje →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                      canProceed()
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Potvrdi rezervaciju ✓
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
