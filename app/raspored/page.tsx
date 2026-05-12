import type { Metadata } from 'next';
import SchedulePage from '@/components/schedule/SchedulePage';

export const metadata: Metadata = {
  title: 'Raspored — ŠRD Kozjak',
  description: 'Tjedni i dnevni raspored aktivnosti u ŠRD Kozjak sportskom centru.',
};

export default function RasporedPage() {
  return <SchedulePage />;
}
