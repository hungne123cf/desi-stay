'use client';

import React, { useState, useMemo } from 'react';
import { HeroSection, MultiMarketFilters } from '@/components/HeroSection';
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
  DoorOpen
} from 'lucide-react';

export default function HomePage() {
  const { properties } = useProperties();
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null);

  const [filters, setFilters] = useState<MultiMarketFilters>({
    city: '',
    university: '',
    roomType: '',
    gender: '',
    zeroBrokerageOnly: false
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      if (filters.city && item.city !== filters.city) return false;
      if (filters.university && item.nearbyUniversity !== filters.university) return false;
      if (filters.roomType && item.roomType !== filters.roomType) return false;
      if (filters.gender && item.gender !== filters.gender && item.gender !== 'all') return false;
      if (filters.zeroBrokerageOnly && !item.isZeroBrokerage) return false;
      return true;
    });
  }, [properties, filters]);

  const resetFilters = () => {
    setFilters({
      city: '',
      university: '',
      roomType: '',
      gender: '',
      zeroBrokerageOnly: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero with Search */}
      <HeroSection
        filters={filters}
        setFilters={setFilters}
        onSearch={() => {
          const el = document.getElementById('listings');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        totalListingsCount={properties.length}
      />

      {/* Main Content Listings */}
      <main id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Danh Sách Phòng Trọ Chính Chủ Đã Xác Thực
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Đang hiển thị{' '}
              <span className="font-bold text-indigo-600">{filteredProperties.length}</span> /{' '}
              {properties.length} phòng trọ tại Việt Nam
            </p>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  city: prev.city === 'Cần Thơ' ? '' : 'Cần Thơ',
                  university: ''
                }))
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                filters.city === 'Cần Thơ'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              📍 Trọ Cần Thơ
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  roomType: prev.roomType === 'studio' ? '' : 'studio'
                }))
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                filters.roomType === 'studio'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              🏢 Căn hộ Studio
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  roomType: prev.roomType === 'double' ? '' : 'double'
                }))
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                filters.roomType === 'double'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
              }`}
            >
              🏠 Phòng gác lửng
            </button>

            {(filters.city ||
              filters.university ||
              filters.roomType ||
              filters.gender ||
              filters.zeroBrokerageOnly) && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 underline ml-2 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
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
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy phòng phù hợp</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Thử bỏ chọn một vài bộ lọc hoặc tìm kiếm ở khu vực khác để có nhiều kết quả hơn.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Xem tất cả phòng trọ
            </button>
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
