'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, GraduationCap, Sparkles, Building2, Navigation, X, Heart, Zap } from 'lucide-react';
import { VIETNAM_LOCATIONS } from '@/data/locations';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating_desc';
export type PriceRangeOption = 'all' | 'under_2.5m' | '2.5m_to_3.5m' | 'above_3.5m';

export interface MultiMarketFilters {
  searchQuery: string;
  city: string;
  area: string;
  university: string;
  roomType: string;
  gender: string;
  priceRange: PriceRangeOption;
  sortBy: SortOption;
  zeroBrokerageOnly: boolean;
  wishlistOnly?: boolean;
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
  const { properties, wishlistIds } = useProperties();
  const { user } = useAuth();
  const router = useRouter();

  // Danh sách tất cả Tỉnh/Thành phố Việt Nam
  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    VIETNAM_LOCATIONS.forEach((c) => citySet.add(c.city));
    properties.forEach((p) => {
      if (p.city) citySet.add(p.city);
    });
    return Array.from(citySet);
  }, [properties]);

  // Danh sách Quận / Huyện / Khu dân cư tự động lọc theo Tỉnh/Thành phố đang chọn
  const availableAreas = useMemo(() => {
    const areaSet = new Set<string>();
    if (filters.city) {
      const matchedCity = VIETNAM_LOCATIONS.find((c) => c.city === filters.city);
      if (matchedCity) {
        matchedCity.districts.forEach((d) => areaSet.add(d));
      }
      properties
        .filter((p) => p.city === filters.city)
        .forEach((p) => {
          if (p.area) areaSet.add(p.area);
        });
    } else {
      properties.forEach((p) => {
        if (p.area) areaSet.add(p.area);
      });
    }
    return Array.from(areaSet);
  }, [filters.city, properties]);

  // Danh sách Trường ĐH tự động lọc theo Tỉnh/Thành phố đang chọn
  const availableUniversities = useMemo(() => {
    const uniSet = new Set<string>();

    if (filters.city) {
      const matchedCity = VIETNAM_LOCATIONS.find((c) => c.city === filters.city);
      if (matchedCity) {
        matchedCity.universities.forEach((u) => uniSet.add(u));
      }
      properties
        .filter((p) => p.city === filters.city)
        .forEach((p) => {
          if (p.nearbyUniversity) uniSet.add(p.nearbyUniversity);
        });
    } else {
      VIETNAM_LOCATIONS.forEach((c) => {
        c.universities.forEach((u) => uniSet.add(u));
      });
      properties.forEach((p) => {
        if (p.nearbyUniversity) uniSet.add(p.nearbyUniversity);
      });
    }

    return Array.from(uniSet);
  }, [filters.city, properties]);

  const handleCityChange = (selectedCity: string) => {
    setFilters((prev) => ({
      ...prev,
      city: selectedCity,
      area: '',
      university: ''
    }));
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-blue-50/30 to-white pt-10 pb-14 lg:pt-14 lg:pb-20 border-b border-slate-100">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/40 via-indigo-100/30 to-emerald-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Nền tảng Phòng trọ &amp; Căn hộ Sinh viên Việt Nam • 0% Phí Môi Giới</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Tìm Trọ Gần Trường.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600">
              Giờ Giấc Tự Do.
            </span>{' '}
            An Tâm Học Tập.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Hệ thống phòng trọ, căn hộ Studio và Ký túc xá đã xác thực quanh các trường Đại học lớn tại Cần Thơ, TP.HCM, Hà Nội, Đà Nẵng và toàn quốc.
          </p>

          {/* Quick Trending Filter Tags (1-Tap Fast Filters) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {/* Wishlist Fast Filter Pill */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  if (
                    confirm(
                      'Bạn cần đăng nhập để xem danh sách phòng Yêu Thích của riêng bạn. Đến trang Đăng Nhập ngay?'
                    )
                  ) {
                    router.push('/auth/login');
                  }
                  return;
                }
                setFilters((prev) => ({
                  ...prev,
                  wishlistOnly: !prev.wishlistOnly
                }));
                onSearch();
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                filters.wishlistOnly
                  ? 'bg-rose-600 text-white shadow-rose-500/25 ring-2 ring-rose-400'
                  : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filters.wishlistOnly ? 'fill-white' : 'text-rose-500'}`} />
              <span>Yêu Thích</span>
              {user && wishlistIds.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  filters.wishlistOnly ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* University Fast Filters */}
            {[
              { label: '🎓 ĐH Cần Thơ (CTU)', uni: 'ĐH Cần Thơ (CTU - Khu II Đường 3/2)', city: 'Cần Thơ' },
              { label: '🏫 ĐH FPT Cần Thơ', uni: 'ĐH FPT Cần Thơ (Khu đô thị An Bình)', city: 'Cần Thơ' },
              { label: '🏥 ĐH Y Dược Cần Thơ', uni: 'ĐH Y Dược Cần Thơ (Đường Nguyễn Văn Cừ)', city: 'Cần Thơ' },
              { label: '⚡ Dưới 2.5 Triệu', price: 'under_2.5m' as const },
              { label: '🏢 Căn hộ Studio', room: 'studio' }
            ].map((chip, idx) => {
              const isActive =
                (chip.uni && filters.university === chip.uni) ||
                (chip.price && filters.priceRange === chip.price) ||
                (chip.room && filters.roomType === chip.room);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      city: chip.city || prev.city,
                      university: chip.uni ? (prev.university === chip.uni ? '' : chip.uni) : prev.university,
                      priceRange: chip.price ? (prev.priceRange === chip.price ? 'all' : chip.price) : prev.priceRange,
                      roomType: chip.room ? (prev.roomType === chip.room ? '' : chip.room) : prev.roomType,
                      wishlistOnly: false
                    }));
                    onSearch();
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-4 sm:p-6 transition-all hover:shadow-2xl space-y-4">
          {/* Keyword Search Input Bar */}
          <div className="relative flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-indigo-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch();
                }}
                placeholder="Tìm phòng theo tên, đường (3/2, NV Cừ), KDC, trường ĐH, mã phòng..."
                className="w-full h-12 pl-11 pr-10 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 text-slate-900 placeholder:text-slate-400"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Xóa từ khóa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onSearch}
              className="w-full sm:w-auto h-12 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Tìm Phòng</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                {totalListingsCount}
              </span>
            </button>
          </div>

          {/* 4-Column Cascading Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* 1. Tỉnh / Thành phố */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Tỉnh / Thành phố
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                <option value="">Tất cả Tỉnh / Thành phố</option>
                {allCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Quận / Huyện / Khu vực */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                {filters.city ? `Quận / Khu vực (${filters.city})` : 'Quận / Huyện / KDC'}
              </label>
              <select
                value={filters.area || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, area: e.target.value }))}
                className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                <option value="">Tất cả Quận / Khu vực</option>
                {availableAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Trường Đại Học / Cao Đẳng */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                {filters.city ? `Trường ĐH tại ${filters.city}` : 'Trường Đại Học / CĐ'}
              </label>
              <select
                value={filters.university}
                onChange={(e) => setFilters((prev) => ({ ...prev, university: e.target.value }))}
                className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                <option value="">
                  {filters.city
                    ? `Tất cả trường tại ${filters.city} (${availableUniversities.length})`
                    : 'Tất cả trường Đại học'}
                </option>
                {availableUniversities.map((u) => (
                  <option key={u} value={u}>
                    🎓 {u}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Loại phòng trọ */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Loại phòng trọ
              </label>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters((prev) => ({ ...prev, roomType: e.target.value }))}
                className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
              >
                <option value="">Tất cả loại phòng</option>
                <option value="studio">Căn hộ Studio khép kín</option>
                <option value="double">Phòng gác lửng / Ở ghép 2 người</option>
                <option value="single">Phòng đơn / Sleepbox riêng tư</option>
                <option value="triple">Ký túc xá / Ở ghép 3-4 người</option>
              </select>
            </div>
          </div>

          {/* Quick Gender & Price Filter Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
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
                  onClick={() => setFilters((prev) => ({ ...prev, gender: item.val }))}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    filters.gender === item.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Khoảng giá:</span>
              {[
                { label: 'Tất cả giá', val: 'all' as PriceRangeOption },
                { label: 'Dưới 2,5 triệu', val: 'under_2.5m' as PriceRangeOption },
                { label: '2,5 – 3,5 triệu', val: '2.5m_to_3.5m' as PriceRangeOption },
                { label: 'Trên 3,5 triệu', val: 'above_3.5m' as PriceRangeOption }
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, priceRange: p.val }))}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    filters.priceRange === p.val
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Vietnamese University Hubs Quick Bar */}
        <div id="cities" className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 hidden sm:inline">Chọn nhanh khu vực:</span>
          {[
            { label: '📍 Cần Thơ (ĐHCT / FPT / Y Dược / DNC)', city: 'Cần Thơ' },
            { label: '📍 TP.HCM (Bách Khoa / Làng ĐH)', city: 'TP. Hồ Chí Minh' },
            { label: '📍 Hà Nội (Cầu Giấy / Bách Khoa / Hòa Lạc)', city: 'Hà Nội' },
            { label: '📍 Đà Nẵng (Ngũ Hành Sơn / Liên Chiểu)', city: 'Đà Nẵng' },
            { label: '📍 Bình Dương (Dĩ An / Thủ Dầu Một)', city: 'Bình Dương' }
          ].map((tag) => (
            <button
              key={tag.city}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  city: prev.city === tag.city ? '' : tag.city,
                  area: '',
                  university: ''
                }));
              }}
              className={`px-3 py-1.5 rounded-full border transition-all text-xs cursor-pointer ${
                filters.city === tag.city
                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white/90 border-slate-200 hover:border-indigo-300 text-slate-700 shadow-2xs'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
