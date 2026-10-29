'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProperties } from '@/context/PropertyContext';
import { BookingModal } from '@/components/BookingModal';
import {
  MapPin,
  GraduationCap,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  ArrowLeft,
  Share2,
  Lock,
  Globe2
} from 'lucide-react';

interface PropertyDetailViewProps {
  propertyId: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId }) => {
  const { properties, formatPrice } = useProperties();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const property = properties.find((p) => p.id === propertyId);

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy phòng</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Phòng trọ này có thể đã được thuê hết hoặc đã ngừng hiển thị.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl"
        >
          Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleContactLandlord = () => {
    const contact = property.landlordContact.replace(/[^0-9]/g, '');
    window.open(`https://zalo.me/${contact}`, '_blank');
  };

  const roomTypeLabels: Record<string, string> = {
    studio: 'Căn hộ Studio',
    '1bhk': 'Căn hộ 1 Phòng Ngủ',
    single: 'Phòng đơn riêng tư',
    shared: 'Ký túc xá / Ở ghép'
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Breadcrumb & Share */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/"
          className="flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tất cả phòng trọ</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden mb-8 border border-slate-200 bg-white p-2">
          {/* Main Large Image */}
          <div className="md:col-span-2 aspect-[16/10] relative overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-md">
                0% Phí Môi Giới
              </span>
              {property.isVerified && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã Xác Thực
                </span>
              )}
            </div>
          </div>

          {/* Side Thumbnail List */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-[16/10] md:h-1/3 rounded-xl overflow-hidden border-2 transition-all shrink-0 w-28 md:w-full ${
                  activeImageIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Property Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Badges */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
                  Mã: {property.code}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800">
                  {roomTypeLabels[property.roomType] || property.roomType}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  {property.city}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {property.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{property.address}, {property.area}, {property.city}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{property.rating} / 5.0</span>
                  <span className="text-slate-400 font-normal">({property.reviewsCount} đánh giá)</span>
                </div>
              </div>

              {/* Campus Proximity Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-indigo-900 font-bold">Vị trí gần trường học / Campus:</p>
                  <p className="text-xs text-indigo-700">
                    Cách <strong>{property.nearbyUniversity}</strong> khoảng <strong>{property.distanceToCampus}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Description & Key Highlights */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Thông tin chi tiết</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Đặc điểm nổi bật
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Tiện ích &amp; Cơ sở vật chất
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curfew & Safety */}
              {property.curfewTime && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">Quy định giờ giấc &amp; An ninh: </span>
                    <span>{property.curfewTime}</span>
                  </div>
                </div>
              )}

              {/* Embedded Real Google Map */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Vị trí thực tế &amp; Đường đi tới trường</span>
                  </h4>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${property.address}, ${property.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Mở trên Google Maps ↗
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 bg-slate-100">
                  <iframe
                    title={`Bản đồ ${property.title}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${property.address}, ${property.city}`
                    )}&output=embed`}
                  />
                </div>
              </div>
            </div>

            {/* Landlord Profile */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {property.landlordName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{property.landlordName}</h4>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Chủ nhà đã xác minh giấy tờ
                  </p>
                </div>
              </div>

              <button
                onClick={handleContactLandlord}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Liên Hệ Trực Tiếp</span>
              </button>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Card (Sticky) */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 space-y-5">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Giá thuê niêm yết</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(property.pricePerMonthUSD, 'VND')}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">/ tháng</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Phí môi giới</span>
                  <span className="font-bold text-emerald-600">0đ (Không thu phí khách)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tiền cọc đảm bảo hợp đồng</span>
                  <span className="font-bold text-slate-800">{formatPrice(property.securityDepositUSD, 'VND')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Tiền cọc giữ chỗ</span>
                    <span className="text-[10px] text-slate-400">Khóa phòng trong 48 giờ</span>
                  </div>
                  <span className="text-base font-black text-indigo-600">
                    {formatPrice(property.tokenDepositUSD, 'VND')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đặt Cọc Giữ Chỗ ({formatPrice(property.tokenDepositUSD, 'VND')})</span>
                </button>

                <button
                  onClick={handleContactLandlord}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Đặt Lịch Hẹn Đến Xem Phòng</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cam kết hoàn tiền 100% nếu phòng không đúng mô tả</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        property={isBookingOpen ? property : null}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
