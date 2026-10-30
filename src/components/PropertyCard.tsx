'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { ReviewModal } from '@/components/ReviewModal';
import {
  MapPin,
  GraduationCap,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Phone,
  Eye,
  Heart,
  Sparkles,
  Zap
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onBookNow?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onBookNow }) => {
  const {
    formatPrice,
    settings,
    reviews,
    getReviewEligibility,
    toggleWishlist,
    isWishlisted
  } = useProperties();
  const { user } = useAuth();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const saved = isWishlisted(property.id);

  const propertyActualReviews = reviews.filter(
    (r) => r.propertyId === property.id || r.propertyCode === property.code
  );
  const propertyReviewsCount = propertyActualReviews.length;
  const propertyRating =
    propertyReviewsCount > 0
      ? Number(
          (propertyActualReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviewsCount).toFixed(1)
        )
      : property.reviewsCount && property.reviewsCount > 0
      ? property.rating
      : 0;

  const eligibility = getReviewEligibility(property.id, property.code, user);

  const getGenderBadge = () => {
    switch (property.gender) {
      case 'boys':
        return { label: '👦 Phòng Nam', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'girls':
        return { label: '👧 Phòng Nữ', bg: 'bg-pink-50 text-pink-700 border-pink-200' };
      default:
        return { label: '🏢 Nam & Nữ', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const getRoomTypeLabel = () => {
    switch (property.roomType) {
      case 'studio':
        return 'Căn hộ Studio';
      case 'double':
        return 'Phòng gác lửng / Đôi';
      case 'single':
        return 'Phòng đơn riêng';
      default:
        return 'Phòng ở ghép';
    }
  };

  const genderBadge = getGenderBadge();

  // Luôn kết nối về Zalo Trung tâm của Admin (Bảo vệ thông tin & tránh cắt cầu)
  const handleContactLandlord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    window.open(`https://zalo.me/${phone}`, '_blank');
  };

  // Phát hiện tiện nghi nổi bật
  const hasFingerprintLock =
    property.curfewTime?.toLowerCase().includes('vân tay') ||
    property.curfewTime?.toLowerCase().includes('tự do') ||
    property.amenities.some((a) => a.toLowerCase().includes('vân tay'));
  const hasAC = property.amenities.some(
    (a) => a.toLowerCase().includes('máy lạnh') || a.toLowerCase().includes('điều hòa')
  );

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
      {/* Image Preview & Carousel - Bấm vào ảnh để mở trang Chi tiết phòng */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link href={`/properties/${property.id}`} className="block w-full h-full">
          <img
            src={
              property.images?.[activeImgIndex] ||
              property.images?.[0] ||
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
            }
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>

        {/* Floating Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {property.isZeroBrokerage && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              0% Phí Môi Giới
            </span>
          )}
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Chính Chủ
            </span>
          )}
        </div>

        {/* Heart Wishlist Button Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(property.id);
          }}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-md border border-white/60 flex items-center justify-center transition-all active:scale-75 cursor-pointer group/heart"
          title={saved ? 'Bỏ lưu phòng này' : 'Thả tim lưu phòng để so sánh'}
        >
          <Heart
            className={`w-4 h-4 transition-transform group-hover/heart:scale-125 ${
              saved
                ? 'fill-rose-500 text-rose-500 animate-in zoom-in-50'
                : 'text-slate-600 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Rating chip Bottom Right */}
        <Link
          href={`/properties/${property.id}#reviews`}
          title={
            propertyReviewsCount > 0
              ? `Đánh giá: ${propertyRating}/5 (${propertyReviewsCount} lượt)`
              : 'Phòng mới đăng - Chưa có đánh giá'
          }
          className="absolute bottom-3 right-3 z-10 bg-white/95 hover:bg-amber-50 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800 border border-amber-200/70 transition-transform hover:scale-105"
        >
          {propertyReviewsCount > 0 ? (
            <>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{propertyRating}</span>
              <span className="text-indigo-600 font-semibold">({propertyReviewsCount})</span>
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-500 font-semibold text-[11px]">Mới đăng (0)</span>
            </>
          )}
        </Link>

        {/* Dots pagination */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1 z-10">
            {property.images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeImgIndex === idx ? 'bg-white w-4' : 'bg-white/60 w-2 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Quick Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${genderBadge.bg}`}>
              {genderBadge.label}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {getRoomTypeLabel()}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              📍 {property.city}
            </span>
            {hasFingerprintLock && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                🔒 Khóa 24/7
              </span>
            )}
            {hasAC && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                ❄️ Máy lạnh
              </span>
            )}
          </div>

          {/* Title & Code */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link
              href={`/properties/${property.id}`}
              className="text-base font-bold text-slate-900 hover:text-indigo-600 group-hover:text-indigo-600 transition-colors line-clamp-1"
            >
              {property.title}
            </Link>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
              {property.code}
            </span>
          </div>

          {/* Distance to Campus Banner */}
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mb-2 bg-indigo-50/80 px-2.5 py-1.5 rounded-xl border border-indigo-100/80">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">
              {property.distanceToCampus} tới {property.nearbyUniversity}
            </span>
          </div>

          {/* Area & City */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {property.address.includes(property.city)
                ? property.address
                : `${property.address}, ${property.area}, ${property.city}`}
            </span>
          </div>

          {/* Highlights */}
          <div className="space-y-1 mb-4 text-xs text-slate-600">
            {property.highlights.slice(0, 2).map((h, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="line-clamp-1">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Action Bottom Strip */}
        <div className="pt-3 border-t border-slate-100 mt-auto space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {formatPrice(property.pricePerMonthUSD, 'VND')}
              </span>
              <span className="text-xs text-slate-500 font-normal"> / tháng</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Cọc giữ chỗ 48h:</span>
              <span className="text-xs font-bold text-indigo-600">
                {formatPrice(property.tokenDepositUSD, 'VND')}
              </span>
            </div>
          </div>

          {/* Buttons: Direct Action */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleContactLandlord}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-xl transition-all cursor-pointer active:scale-98"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhắn Zalo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onBookNow) {
                  onBookNow(property);
                } else if (typeof window !== 'undefined') {
                  window.location.href = `/properties/${property.id}`;
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-98"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Giữ Chỗ</span>
            </button>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="w-full flex items-center justify-center gap-1 py-1 text-slate-400 hover:text-indigo-600 text-[11px] font-medium transition-colors"
          >
            <span>Xem hình ảnh &amp; chi tiết phòng</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Review Modal Popup khi bấm nút Đánh Giá */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        property={property}
        booking={eligibility.nextBookingToReview}
        remainingQuota={eligibility.remainingReviews}
        totalPurchases={eligibility.totalPurchases}
        usedReviews={eligibility.usedReviews}
      />
    </div>
  );
};
