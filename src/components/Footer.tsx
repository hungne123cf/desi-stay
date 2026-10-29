'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ShieldCheck, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';
import { useProperties } from '@/context/PropertyContext';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { settings } = useProperties();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white">
                  {settings.brandName || 'UniStay'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
                  Việt Nam
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Nền tảng tìm kiếm phòng trọ, căn hộ Studio và phòng gác lửng đã xác thực dành riêng cho sinh viên tại Cần Thơ và các thành phố đại học trên toàn quốc. Làm việc trực tiếp chính chủ, 0% phí môi giới.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">
                <ShieldCheck className="w-4 h-4" />
                100% Trọ Chính Chủ Đã Xác Thực
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/80">
                <HeartHandshake className="w-4 h-4" />
                0đ Phí Môi Giới
              </div>
            </div>
          </div>

          {/* Khu vực trường Đại học tại Cần Thơ */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Khu Vực Cần Thơ
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#listings" className="hover:text-indigo-400 transition-colors">
                  ĐH Cần Thơ (Khu II - Đường 3/2)
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-indigo-400 transition-colors">
                  ĐH FPT Cần Thơ &amp; KDC Hồng Phát
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-indigo-400 transition-colors">
                  ĐH Y Dược Cần Thơ (Nguyễn Văn Cừ)
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-indigo-400 transition-colors">
                  ĐH Nam Cần Thơ (DNC) &amp; KDC 91B
                </a>
              </li>
              <li>
                <a href="#listings" className="hover:text-indigo-400 transition-colors">
                  ĐH Kỹ thuật - Công nghệ &amp; ĐH Tây Đô
                </a>
              </li>
            </ul>
          </div>

          {/* Loại hình phòng trọ */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Loại Hình Phòng Trọ
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-300">Căn hộ Studio ban công khép kín</span>
              </li>
              <li>
                <span className="text-slate-300">Phòng trọ gác lửng mới xây</span>
              </li>
              <li>
                <span className="text-slate-300">Phòng đơn / Ký túc xá Sleepbox</span>
              </li>
              <li>
                <span className="text-slate-300">Nhà trọ giờ giấc tự do 24/7</span>
              </li>
              <li>
                <span className="text-slate-300">Phòng ở ghép tiết kiệm gần trường</span>
              </li>
            </ul>
          </div>

          {/* Liên hệ hỗ trợ */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Liên Hệ &amp; Hỗ Trợ
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Hotline / Zalo hỗ trợ</p>
                  <a
                    href={`tel:${settings.supportHotline || '0901234567'}`}
                    className="text-white font-semibold hover:text-indigo-400"
                  >
                    {settings.supportHotline || '0901 234 567'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email liên hệ</p>
                  <p className="text-white font-semibold">hotro@unistay.vn</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Văn phòng đại diện</p>
                  <p className="text-slate-300 text-xs">
                    Đường Nguyễn Văn Cừ nối dài, Q. Ninh Kiều, TP. Cần Thơ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 UniStay Việt Nam – Hệ thống Phòng trọ Sinh viên Cần Thơ &amp; Toàn Quốc.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-indigo-400 transition-colors font-medium">
              Trang Quản Trị Chủ Trọ (Admin)
            </Link>
            <span className="hover:text-slate-400">Quy định đặt cọc</span>
            <span className="hover:text-slate-400">Chính sách bảo mật</span>
            <span className="hover:text-slate-400">Cam kết hoàn tiền 100%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
