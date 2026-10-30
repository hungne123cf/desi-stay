'use client';

import React, { useState, useMemo } from 'react';
import { HeroSection, MultiMarketFilters, SortOption, PriceRangeOption } from '@/components/HeroSection';
import { PropertyCard } from '@/components/PropertyCard';
import { BookingModal } from '@/components/BookingModal';
import { useProperties } from '@/context/PropertyContext';
import { Property } from '@/types';
import {
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  SearchX,
  GraduationCap,
  DoorOpen,
  ArrowUpDown,
  X,
  Heart,
  SlidersHorizontal
} from 'lucide-react';

// Hàm bỏ dấu tiếng Việt giúp tìm kiếm không dấu vẫn ra kết quả chính xác
function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function HomePage() {
  const { properties, wishlistIds } = useProperties();
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null);

  const [filters, setFilters] = useState<MultiMarketFilters>({
    searchQuery: '',
    city: '',
    area: '',
    university: '',
    roomType: '',
    gender: '',
    priceRange: 'all',
    sortBy: 'newest',
    zeroBrokerageOnly: false,
    wishlistOnly: false
  });

  const filteredProperties = useMemo(() => {
    const EXCHANGE_VND = 25400;
    const queryNorm = removeVietnameseAccents(filters.searchQuery.trim());

    const matched = properties.filter((item) => {
      // 0. Bỏ qua các phòng đã bị xóa mềm (đang trong thùng rác)
      if (item.isDeleted) return false;

      // 0.5. Lọc theo danh sách yêu thích (Wishlist)
      if (filters.wishlistOnly && !wishlistIds.includes(item.id)) {
        return false;
      }

      // 1. Lọc theo từ khóa tìm kiếm (Tên phòng, địa chỉ, quận/huyện, trường ĐH, mã phòng)
      if (queryNorm) {
        const searchableText = removeVietnameseAccents(
          `${item.title} ${item.address} ${item.area} ${item.city} ${item.nearbyUniversity} ${item.code} ${item.description}`
        );
        if (!searchableText.includes(queryNorm)) return false;
      }

      // 2. Lọc theo Tỉnh/Thành phố (so khớp không phân biệt hoa thường)
      if (
        filters.city &&
        removeVietnameseAccents(item.city) !== removeVietnameseAccents(filters.city)
      ) {
        return false;
      }

      // 3. Lọc theo Quận/Huyện/KDC
      if (
        filters.area &&
        !removeVietnameseAccents(`${item.area} ${item.address}`).includes(
          removeVietnameseAccents(filters.area)
        )
      ) {
        return false;
      }

      // 4. Lọc theo Trường Đại học
      if (filters.university && item.nearbyUniversity !== filters.university) {
        return false;
      }

      // 5. Lọc theo Loại phòng
      if (filters.roomType && item.roomType !== filters.roomType) {
        return false;
      }

      // 6. Lọc theo Đối tượng ở
      if (filters.gender && item.gender !== filters.gender && item.gender !== 'all') {
        return false;
      }

      // 7. Lọc theo Khoảng giá VNĐ
      if (filters.priceRange !== 'all') {
        const priceVND = item.pricePerMonthUSD * EXCHANGE_VND;
        if (filters.priceRange === 'under_2.5m' && priceVND >= 2500000) return false;
        if (filters.priceRange === '2.5m_to_3.5m' && (priceVND < 2500000 || priceVND > 3500000)) {
          return false;
        }
        if (filters.priceRange === 'above_3.5m' && priceVND <= 3500000) return false;
      }

      if (filters.zeroBrokerageOnly && !item.isZeroBrokerage) return false;
      return true;
    });

    // 8. Sắp xếp kết quả (Sort Filter)
    return [...matched].sort((a, b) => {
      if (filters.sortBy === 'price_asc') {
        return a.pricePerMonthUSD - b.pricePerMonthUSD;
      }
      if (filters.sortBy === 'price_desc') {
        return b.pricePerMonthUSD - a.pricePerMonthUSD;
      }
      if (filters.sortBy === 'rating_desc') {
        return b.rating - a.rating;
      }
      // Mặc định 'newest': Ưu tiên phòng do Admin mới tạo (id dạng prop-17...) lên đầu tiên
      const aCustomTime = /^prop-(\d+)$/.exec(a.id)?.[1];
      const bCustomTime = /^prop-(\d+)$/.exec(b.id)?.[1];
      if (aCustomTime && bCustomTime) {
        return Number(bCustomTime) - Number(aCustomTime);
      }
      if (aCustomTime) return -1;
      if (bCustomTime) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [properties, filters]);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      city: '',
      area: '',
      university: '',
      roomType: '',
      gender: '',
      priceRange: 'all',
      sortBy: 'newest',
      zeroBrokerageOnly: false
    });
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
      filters.city ||
      filters.area ||
      filters.university ||
      filters.roomType ||
      filters.gender ||
      filters.priceRange !== 'all' ||
      filters.zeroBrokerageOnly ||
      Boolean(filters.wishlistOnly)
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero with Search & Cascading Filters */}
      <HeroSection
        filters={filters}
        setFilters={setFilters}
        onSearch={() => {
          const el = document.getElementById('listings');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        totalListingsCount={filteredProperties.length}
      />

      {/* Main Content Listings */}
      <main id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header & Quick Sort Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Danh Sách Phòng Trọ Chính Chủ Đã Xác Thực
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs sm:text-sm text-slate-500">
                Đang hiển thị{' '}
                <span className="font-bold text-indigo-600">{filteredProperties.length}</span> /{' '}
                {properties.length} phòng trọ tại Việt Nam
              </p>
              {filters.wishlistOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>Đang xem phòng đã lưu</span>
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                  title="Đặt lại tất cả bộ lọc"
                >
                  <X className="w-3 h-3" />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 transition-colors">
              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-500">Sắp xếp:</span>
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
                }
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer flex-1 sm:flex-initial text-right sm:text-left"
              >
                <option value="newest">Mới đăng nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao xuống Thấp</option>
                <option value="rating_desc">Đánh giá sao cao nhất ⭐</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onBookNow={(p) => setSelectedPropertyForBooking(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 mt-8 p-8">
            <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              {properties.length === 0
                ? 'Hiện chưa có phòng trọ nào được đăng'
                : 'Không tìm thấy phòng phù hợp với bộ lọc'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              {properties.length === 0
                ? 'Chưa có phòng nào. Khi Admin thêm phòng mới, danh sách sẽ tự động hiển thị tại đây.'
                : 'Bạn đang bật bộ lọc hoặc nhập từ khóa tìm kiếm (ví dụ trên thanh Search đang có chữ). Hãy xóa bộ lọc để xem toàn bộ danh sách phòng.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Xóa bộ lọc &amp; Xem tất cả phòng</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black">
                  {properties.length}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Value Proposition */}
        <section id="benefits" className="mt-24 pt-16 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Tiêu chuẩn phòng trọ sinh viên Việt Nam
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              An Tâm Thuê Trọ • Minh Bạch Từng Khoản Chi
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Không lo mất cọc oan, không qua cò mồi trung gian, làm việc trực tiếp với chủ trọ uy tín tại Cần Thơ và các thành phố lớn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <DoorOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Giờ Giấc Tự Do 24/7 &amp; Khóa Vân Tay
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Các khu trọ và căn hộ đều trang bị khóa cửa vân tay, camera an ninh nhà xe, không chung chủ, thuận tiện cho sinh viên đi học và làm thêm.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                100% Xác Thực Địa Chỉ &amp; Chính Chủ
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kiểm duyệt kỹ hình ảnh thực tế, giá điện nước niêm yết rõ ràng và hỗ trợ đăng ký tạm trú cho sinh viên. Cam kết hoàn 100% tiền cọc nếu sai mô tả.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                0đ Phí Môi Giới Cho Sinh Viên
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sinh viên và phụ huynh tìm phòng hoàn toàn miễn phí. Đặt lịch hẹn xem phòng trực tiếp hoặc giữ chỗ nhanh qua mã VietQR ngân hàng.
              </p>
            </div>
          </div>
        </section>

        {/* Cần Thơ & Tân Sinh Viên Support Banner */}
        <section className="mt-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              Hỗ Trợ Tân Sinh Viên Cần Thơ &amp; ĐBSCL
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Bạn là Tân Sinh Viên mới nhập học tại Cần Thơ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Đội ngũ UniStay tại Ninh Kiều &amp; Cái Răng hỗ trợ tư vấn miễn phí các khu nhà trọ an ninh, cao ráo không ngập nước gần ĐH Cần Thơ, ĐH FPT Cần Thơ, ĐH Y Dược và ĐH Nam Cần Thơ.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://zalo.me/0901234567"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Nhắn Zalo Tư Vấn Tìm Trọ Miễn Phí</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Modal */}
      <BookingModal
        property={selectedPropertyForBooking}
        onClose={() => setSelectedPropertyForBooking(null)}
      />
    </div>
  );
}
