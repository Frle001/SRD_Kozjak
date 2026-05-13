import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ReservationProvider } from '@/components/ReservationProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ŠRD Kozjak — Rezervacije',
  description:
    'Rezervirajte termin u Športsko-rekreacijskom društvu Kozjak. Mali nogomet, stolni tenis, treninzi, rođendani i više.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
        <ReservationProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ReservationProvider>
      </body>
    </html>
  );
}
