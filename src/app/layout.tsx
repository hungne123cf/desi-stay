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
  title: 'UniStay Việt Nam | Hệ Thống Phòng Trọ & Căn Hộ Sinh Viên Cần Thơ & Toàn Quốc',
  description:
    'Tìm phòng trọ, căn hộ Studio, phòng gác lửng đã xác thực gần ĐH Cần Thơ, ĐH FPT Cần Thơ, ĐH Y Dược, ĐH Nam Cần Thơ và các trường đại học lớn tại Việt Nam. 0% phí môi giới, giờ giấc tự do.',
  keywords: [
    'phòng trọ sinh viên cần thơ',
    'nhà trọ ninh kiều cần thơ',
    'phòng trọ gần đại học cần thơ',
    'phòng trọ đại học fpt cần thơ',
    'căn hộ mini sinh viên',
    'unistay việt nam'
  ]
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
