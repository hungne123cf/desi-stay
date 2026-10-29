import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PropertyProvider } from '@/context/PropertyContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://desi-stay.vercel.app'),
  title: 'UniStay Việt Nam (desi-stay) | Hệ Thống Phòng Trọ & Căn Hộ Sinh Viên',
  description:
    'Nền tảng desi-stay - UniStay Việt Nam: Tìm phòng trọ, căn hộ Studio, phòng gác lửng đã xác thực gần ĐH Cần Thơ, FPT, Y Dược và các trường đại học toàn quốc. 0% phí môi giới, cọc giữ chỗ VietQR an toàn.',
  keywords: [
    'desi-stay',
    'desi stay',
    'desi-stay vercel',
    'unistay',
    'phòng trọ sinh viên cần thơ',
    'nhà trọ ninh kiều cần thơ',
    'phòng trọ gần đại học cần thơ',
    'phòng trọ đại học fpt cần thơ',
    'căn hộ mini sinh viên',
    'unistay việt nam'
  ],
  authors: [{ name: 'UniStay Vietnam (desi-stay)' }],
  openGraph: {
    title: 'UniStay Việt Nam (desi-stay) | Phòng Trọ & Căn Hộ Sinh Viên',
    description:
      'Nền tảng desi-stay - Tìm phòng trọ, căn hộ Studio chính chủ đã xác thực 0% phí môi giới.',
    url: 'https://desi-stay.vercel.app',
    siteName: 'UniStay (desi-stay)',
    locale: 'vi_VN',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900 selection:bg-indigo-600 selection:text-white">
        <AuthProvider>
          <PropertyProvider>
            <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200/80" />}>
              <Navbar />
            </Suspense>
            <div className="flex-1">{children}</div>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
            <Suspense fallback={null}>
              <WhatsAppFloat />
            </Suspense>
          </PropertyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
