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
  MessageSquare
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onBookNow: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onBookNow }) => {
  const { formatPrice, settings, reviews, getReviewEligibility } = useProperties();
  const { user } = useAuth();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
        return 'Phòng đơn';
      default:
        return 'Phòng ở ghép';
    }
  };

  const genderBadge = getGenderBadge();

  // Luôn kết nối về Zalo Trung tâm của Admin (Môi giới nắm đằng chuôi)
  const handleContactLandlord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    window.open(`https://zalo.me/${phone}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col">
      {/* Image Preview & Carousel - Bấm vào ảnh để mở trang Chi tiết phòng */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link href={`/properties/${property.id}`} className="block w-full h-full">
          <img
            src={property.images?.[activeImgIndex] || property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {property.isZeroBrokerage && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm">
              0% Phí Môi Giới
            </span>
          )}
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trọ Đã Xác Thực
            </span>
          )}
        </div>

        {/* Rating chip - Bấm vào để nhảy thẳng tới mục Đánh giá & Bình luận */}
        <Link
          href={`/properties/${property.id}#reviews`}
          title={
            propertyReviewsCount > 0
              ? `Đánh giá: ${propertyRating}/5 (${propertyReviewsCount} lượt)`
              : 'Phòng mới đăng - Chưa có đánh giá'
          }
          className="absolute bottom-3 right-3 z-10 bg-white/95 hover:bg-amber-50 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800 border border-amber-200/60 transition-transform hover:scale-105"
        >
          {propertyReviewsCount > 0 ? (
            <>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{propertyRating}</span>
              <span className="text-indigo-600 font-semibold">({propertyReviewsCount} đánh giá)</span>
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-500 font-semibold text-[11px]">Chưa có đánh giá (0)</span>
            </>
          )}
        </Link>

        {/* Dots */}
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
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImgIndex === idx ? 'bg-white w-4' : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Badges row */}
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
        </div>

        {/* Title & Code */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/properties/${property.id}`}
            className="text-base font-bold text-slate-900 hover:text-indigo-600 group-hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {property.title}
          </Link>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
            {property.code}
          </span>
        </div>

        {/* Distance to Campus */}
        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mb-2 bg-indigo-50/70 px-2.5 py-1 rounded-xl">
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
        <div className="space-y-1 mb-4 text-xs text-slate-600 flex-1">
          {property.highlights.slice(0, 2).map((h, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="line-clamp-1">{h}</span>
            </div>
          ))}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 mt-auto space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-slate-900">
                {formatPrice(property.pricePerMonthUSD, 'VND')}
              </span>
              <span className="text-xs text-slate-500 font-normal"> / tháng</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Cọc giữ phòng:</span>
              <span className="text-xs font-bold text-indigo-600">
                {formatPrice(property.tokenDepositUSD, 'VND')}
              </span>
            </div>
          </div>

          {/* Nút Xem Chi Tiết Phòng & Nút Đánh Giá (chỉ hiện sau khi đã đặt phòng) */}
          {eligibility.hasPurchased ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/properties/${property.id}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Xem Chi Tiết</span>
              </Link>

              {eligibility.remainingReviews > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Đánh Giá ({eligibility.remainingReviews} lượt)</span>
                </button>
              ) : (
                <Link
                  href={`/properties/${property.id}#reviews`}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200 rounded-xl"
                  title="Bạn đã sử dụng hết lượt đánh giá cho lần đặt phòng này"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Đã Đánh Giá ({eligibility.usedReviews}/{eligibility.totalPurchases})</span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              href={`/properties/${property.id}`}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                Xem Chi Tiết Phòng{propertyReviewsCount > 0 ? ` (${propertyReviewsCount} đánh giá)` : ''}
              </span>
            </Link>
          )}

          {/* Nút Nhắn Zalo & Đặt Cọc Giữ Chỗ */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleContactLandlord}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhắn Zalo</span>
            </button>

            <button
              type="button"
              onClick={() => onBookNow(property)}
              className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>Giữ Chỗ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
