'use client';

import React from 'react';
import { Search, MapPin, GraduationCap, Users, Sparkles, Building2 } from 'lucide-react';
import { CITIES, UNIVERSITIES } from '@/data/mockProperties';

export interface MultiMarketFilters {
  city: string;
  university: string;
  roomType: string;
  gender: string;
  zeroBrokerageOnly: boolean;
}

interface HeroSectionProps {
  filters: MultiMarketFilters;
  setFilters: React.Dispatch<React.SetStateAction<MultiMarketFilters>>;
  onSearch: () => void;
  totalListingsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  setFilters,
  onSearch,
  totalListingsCount
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-blue-50/30 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/40 via-indigo-100/30 to-emerald-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Nền tảng Phòng trọ &amp; Nhà ở Sinh viên Quốc tế • 0% Phí Môi Giới</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Tìm Trọ Gần Trường.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600">
              Giờ Giấc Tự Do.
            </span>{' '}
            An Tâm Học Tập.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Hàng ngàn phòng trọ, căn hộ studio và ký túc xá sinh viên quanh các trường Đại học lớn tại Việt Nam và quốc tế. Khóa vân tay, vệ sinh khép kín, giữ chỗ online minh bạch.
          </p>
        </div>

        {/* Search Engine Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-4 sm:p-6 transition-all hover:shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* City Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Thành phố / Khu vực
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c.includes('Tất cả') ? '' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* University Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Trường Đại Học / Cao Đẳng
              </label>
              <select
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u.includes('Tất cả') ? '' : u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Loại phòng trọ
              </label>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                <option value="">Tất cả loại phòng</option>
                <option value="single">Phòng đơn / Sleepbox riêng tư</option>
                <option value="double">Phòng ở ghép 2 người (Tiết kiệm)</option>
                <option value="studio">Căn hộ Studio khép kín (Full đồ)</option>
              </select>
            </div>
          </div>

          {/* Quick Gender Chips & Search Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Đối tượng:</span>
              {[
                { label: 'Tất cả', val: '' },
                { label: '👦 Nam', val: 'boys' },
                { label: '👧 Nữ', val: 'girls' },
                { label: '🏢 Nam/Nữ', val: 'all' }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFilters({ ...filters, gender: item.val })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    filters.gender === item.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={onSearch}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Xem {totalListingsCount} Phòng Trọ Đang Trống</span>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-slate-900">100% Xác Thực</div>
            <div className="text-xs text-slate-500 font-medium">Chính chủ kiểm duyệt</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-indigo-600">0đ Phí Môi Giới</div>
            <div className="text-xs text-slate-500 font-medium">Làm việc trực tiếp chủ nhà</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-emerald-600">VietQR &amp; Thẻ</div>
            <div className="text-xs text-slate-500 font-medium">Cọc giữ phòng an toàn</div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-blue-600">24/7 Tự Do</div>
            <div className="text-xs text-slate-500 font-medium">Khóa vân tay &amp; An ninh</div>
          </div>
        </div>
      </div>
    </div>
  );
};
