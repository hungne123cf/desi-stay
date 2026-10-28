import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PropertyProvider } from '@/context/PropertyContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'YuvaStays | Verified Student Housing & PGs for Indian Students',
  description:
    'Find safe, verified student PGs and hostels near top universities in India and abroad. Pure Veg mess, zero brokerage, biometric security, and 24/7 student support.',
  keywords: [
    'student accommodation',
    'indian student housing',
    'pure veg PG',
    'girls hostel',
    'boys PG',
    'zero brokerage student flats',
    'Christ University PG',
    'DU North Campus PG',
    'MBBS Vietnam housing'
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900 selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <PropertyProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <WhatsAppFloat />
          </PropertyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
