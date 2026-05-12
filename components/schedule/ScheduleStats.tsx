'use client';

import { motion } from 'framer-motion';
import type { ScheduleActivity } from '@/lib/mock-schedule';
import { SERVICE_PRICE } from '@/lib/mock-schedule';
import { staggerContainer, fadeUp } from '@/lib/animations';

interface Props {
  activities: ScheduleActivity[];
  weekLabel: string;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub: string;
  gradient: string;
}

function StatCard({ icon, label, value, sub, gradient }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden ${gradient}`}
    >
      <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
      <div className="relative">
        <span className="text-2xl">{icon}</span>
        <div className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight">{value}</div>
        <div className="text-sm font-semibold opacity-90 mt-0.5">{label}</div>
        <div className="text-xs opacity-65 mt-1">{sub}</div>
      </div>
    </motion.div>
  );
}

export default function ScheduleStats({ activities, weekLabel }: Props) {
  const active = activities.filter((a) => a.status !== 'otkazano');
  const confirmed = activities.filter((a) => a.status === 'potvrđeno').length;
  const pending   = activities.filter((a) => a.status === 'novo').length;
  const birthdays = activities.filter((a) => a.serviceId === 'rodendani').length;
  const revenue   = active
    .filter((a) => a.status === 'potvrđeno' || a.status === 'plaćeno')
    .reduce((sum, a) => sum + SERVICE_PRICE[a.serviceId], 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-green-600 text-xs font-semibold uppercase tracking-widest">Statistike tjedna</span>
          <p className="text-xs text-slate-400 mt-0.5">{weekLabel}</p>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <StatCard
          icon="📋" label="Ukupno aktivnosti"
          value={active.length} sub="bez otkazanih"
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
        />
        <StatCard
          icon="✅" label="Potvrđeno"
          value={confirmed} sub="čekaju termin"
          gradient="bg-gradient-to-br from-green-500 to-green-700"
        />
        <StatCard
          icon="⏳" label="Čeka potvrdu"
          value={pending} sub={pending > 0 ? 'potrebna akcija' : 'sve obrađeno'}
          gradient={pending > 0
            ? 'bg-gradient-to-br from-orange-400 to-orange-600'
            : 'bg-gradient-to-br from-slate-500 to-slate-700'}
        />
        <StatCard
          icon="🎂" label="Rođendani"
          value={birthdays} sub="posebni eventi"
          gradient="bg-gradient-to-br from-rose-500 to-rose-700"
        />
        <StatCard
          icon="💶" label="Procij. prihod"
          value={`${revenue} €`} sub="potvrđeno + plaćeno"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
      </motion.div>
    </div>
  );
}
