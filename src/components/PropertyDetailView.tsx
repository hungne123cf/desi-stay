'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { BookingModal } from '@/components/BookingModal';
import { ReviewModal } from '@/components/ReviewModal';
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
  MessageSquare,
  Send,
  Trash2,
  CornerDownRight,
  Heart,
  Calculator,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface PropertyDetailViewProps {
  propertyId: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId }) => {
  const {
    properties,
    formatPrice,
    settings,
    reviews,
    addReview,
    replyToReview,
    deleteReview,
    getReviewEligibility,
    toggleWishlist,
    isWishlisted
  } = useProperties();
  const { user } = useAuth();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // State cho chức năng Rating & Comment
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>(user?.name || '');
  const [reviewerCollege, setReviewerCollege] = useState<string>(user?.college || '');
  const [commentText, setCommentText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const property = properties.find(
    (p) => p.id === propertyId || p.code === propertyId || p.slug === propertyId
  );
  const saved = property ? isWishlisted(property.id) : false;

  const propertyReviews = useMemo(() => {
    if (!property) return [];
    return reviews.filter(
      (r) =>
        !r.isDeleted &&
        (r.propertyId === property.id ||
          (property.code && r.propertyCode === property.code) ||
          (property.code && r.propertyId === property.code) ||
          (property.slug && r.propertyId === property.slug))
    );
  }, [property, reviews]);

  const propertyReviewsCount = propertyReviews.length;
  const propertyRating =
    propertyReviewsCount > 0
      ? Number(
          (propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviewsCount).toFixed(1)
        )
      : property?.reviewsCount && property.reviewsCount > 0
      ? property.rating
      : 0;

  const eligibility = property
    ? getReviewEligibility(property.id, property.code, user)
    : {
        hasPurchased: false,
        totalPurchases: 0,
        usedReviews: 0,
        remainingReviews: 0,
        nextBookingToReview: null
      };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property || property.isDeleted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Phòng trọ này hiện đang tạm đóng hoặc không còn khả dụng</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Phòng trọ này có thể đã được thuê hết, chủ nhà tạm ngưng hoặc đã chuyển vào mục lưu trữ.
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

  // Luôn kết nối về Zalo Trung tâm của Admin (Môi giới nắm đằng chuôi, không lộ SĐT chủ nhà gốc)
  const handleContactLandlord = () => {
    const adminZalo = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    window.open(`https://zalo.me/${adminZalo}`, '_blank');
  };

  const roomTypeLabels: Record<string, string> = {
    studio: 'Căn hộ Studio',
    '1bhk': 'Căn hộ 1 Phòng Ngủ',
    single: 'Phòng đơn riêng tư',
    shared: 'Ký túc xá / Ở ghép'
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-32 lg:pb-20">
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
          {property && (
            <button
              onClick={() => {
                if (!user) {
                  if (
                    confirm(
                      'Bạn cần đăng nhập để lưu phòng vào danh sách Yêu Thích của riêng bạn. Đến trang Đăng Nhập ngay?'
                    )
                  ) {
                    router.push('/auth/login');
                  }
                  return;
                }
                toggleWishlist(property.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                saved
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                  : 'bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-700'
              }`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              <span>{saved ? 'Đã thích' : 'Yêu thích'}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Photo Gallery Grid - Airbnb Style */}
        <div className="mb-8">
          {/* Desktop 5-slot grid */}
          <div className="hidden md:grid grid-cols-4 gap-2.5 rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 p-2 relative shadow-lg">
            {/* Main large photo (Col 1-2) */}
            <div
              onClick={() => setActiveImageIndex(0)}
              className="col-span-2 aspect-[4/3] relative overflow-hidden rounded-2xl cursor-pointer group"
            >
              <img
                src={
                  property.images?.[0] ||
                  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
                }
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
                  0% Phí Môi Giới
                </span>
                {property.isVerified && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Đã Xác Thực
                  </span>
                )}
              </div>
            </div>

            {/* 4 Thumbnails on the right (Col 3-4, 2x2 grid) */}
            <div className="col-span-2 grid grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((slotIdx) => {
                const imgUrl =
                  property.images?.[slotIdx] ||
                  property.images?.[slotIdx % (property.images?.length || 1)] ||
                  property.images?.[0] ||
                  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

                return (
                  <div
                    key={slotIdx}
                    onClick={() => setActiveImageIndex(slotIdx % (property.images?.length || 1))}
                    className="aspect-[4/3] rounded-2xl overflow-hidden relative cursor-pointer group bg-slate-800"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ảnh ${slotIdx}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                );
              })}
            </div>

            {/* Floating button: Xem tất cả ảnh */}
            <div className="absolute bottom-5 right-5 z-10">
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev + 1) % (property.images?.length || 1))}
                className="px-4 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-bold text-xs shadow-xl border border-slate-200 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Xem ảnh</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {property.images?.length || 1}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Single Carousel view */}
          <div className="md:hidden relative aspect-[16/10] rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md">
            <img
              src={
                property.images?.[activeImageIndex] ||
                property.images?.[0] ||
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
              }
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-1.5 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-600 text-white shadow-sm">
                0% Phí Môi Giới
              </span>
              {property.isVerified && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm">
                  Đã Xác Thực
                </span>
              )}
            </div>
            {property.images && property.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeImageIndex + 1} / {property.images.length}
              </div>
            )}
            {/* Mobile Thumbnails Scrollbar */}
            {property.images && property.images.length > 1 && (
              <div className="absolute bottom-3 left-3 flex gap-1">
                {property.images.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
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
                  <span>
                    {property.address.includes(property.city)
                      ? property.address
                      : `${property.address}, ${property.area}, ${property.city}`}
                  </span>
                </div>
                {propertyReviewsCount > 0 ? (
                  <div className="flex items-center gap-1 text-slate-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{propertyRating} / 5.0</span>
                    <span className="text-slate-400 font-normal">({propertyReviewsCount} đánh giá)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Star className="w-4 h-4 text-slate-400" />
                    <span>Chưa có đánh giá (0)</span>
                  </div>
                )}
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

            {/* Central Broker / Management Profile (Ẩn SĐT chủ nhà gốc để chống cắt cầu) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {(settings.brandName || 'U').charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Ban Quản Lý &amp; Hỗ Trợ Xem Phòng – {settings.brandName}
                  </h4>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đơn vị xác thực &amp; bảo lãnh tiền cọc giữ chỗ 100%
                  </p>
                </div>
              </div>

              <button
                onClick={handleContactLandlord}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Nhắn Zalo Hỗ Trợ Xem Phòng</span>
              </button>
            </div>

            {/* Rating & Comments (Đánh giá & Bình luận của Sinh viên) */}
            {(() => {
              const eligibility = getReviewEligibility(property.id, property.code, user);

              const ratingLabels: Record<number, string> = {
                1: '1 Sao – Chưa tốt',
                2: '2 Sao – Tạm ổn',
                3: '3 Sao – Khá tốt',
                4: '4 Sao – Hài lòng',
                5: '5 Sao – Rất tuyệt vời'
              };

              const handleSubmitReview = (e: React.FormEvent) => {
                e.preventDefault();
                if (eligibility.remainingReviews <= 0 || !eligibility.nextBookingToReview) {
                  return;
                }

                const activeBooking = eligibility.nextBookingToReview;
                const finalName = (
                  user?.name ||
                  reviewerName ||
                  activeBooking.studentName
                ).trim();
                if (!finalName || !commentText.trim()) return;

                addReview({
                  bookingId: activeBooking.id,
                  propertyId: property.id,
                  propertyCode: property.code,
                  propertyTitle: property.title,
                  userName: finalName,
                  userEmail: user?.email || activeBooking.studentEmail,
                  userAvatar: user?.avatar,
                  userCollege:
                    (user?.college || reviewerCollege || activeBooking.college).trim() ||
                    property.nearbyUniversity,
                  rating: ratingInput,
                  comment: commentText.trim()
                });

                setCommentText('');
                setReviewSubmitted(true);
                setTimeout(() => setReviewSubmitted(false), 5000);
              };

              return (
                <div
                  id="reviews"
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 scroll-mt-24"
                >
                  {/* Header thống kê đánh giá */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Đánh Giá &amp; Bình Luận
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                          {propertyReviewsCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-10.5">
                        100% nhận xét xác thực từ sinh viên đã đặt phòng (Tối đa 1 lượt đánh giá / 1 lần đặt phòng)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
                      <div className="text-2xl font-black text-slate-800">
                        {propertyReviewsCount > 0 ? propertyRating : '0'}
                      </div>
                      <div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                propertyReviewsCount > 0 && star <= Math.round(propertyRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {propertyReviewsCount > 0
                            ? `${propertyReviewsCount} nhận xét từ sinh viên`
                            : 'Chưa có đánh giá nào từ người thuê'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {reviewSubmitted && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Cảm ơn bạn! Đánh giá và bình luận của bạn đã được ghi nhận (Đã sử dụng {eligibility.usedReviews}/{eligibility.totalPurchases} lượt đánh giá).
                      </span>
                    </div>
                  )}

                  {/* KHU VỰC KIỂM TRA QUYỀN ĐÁNH GIÁ (CHỈ HIỆN KHI ĐÃ MUA & CÒN LƯỢT) */}
                  {eligibility.remainingReviews > 0 && eligibility.nextBookingToReview ? (
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-indigo-50/50 to-amber-50/40 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                          <Star className="w-6 h-6 fill-slate-950" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 text-base">
                              Bạn đã đặt phòng thành công!
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                              Còn {eligibility.remainingReviews} lượt đánh giá
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Đơn đặt phòng #{eligibility.nextBookingToReview?.reference || eligibility.nextBookingToReview?.id} đã được xác thực. Bạn có thể mở cửa sổ để chấm điểm sao và gửi nhận xét thực tế.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all active:scale-95"
                      >
                        <Star className="w-4 h-4 fill-slate-950" />
                        <span>Viết Đánh Giá Của Bạn (Popup)</span>
                      </button>
                    </div>
                  ) : eligibility.hasPurchased ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-950 block">
                            Bạn đã sử dụng hết lượt đánh giá ({eligibility.usedReviews}/{eligibility.totalPurchases} lượt) cho phòng trọ này
                          </span>
                          <span className="text-emerald-800 text-[11px]">
                            Mỗi lần đặt phòng thành công được cấp tối đa 1 lượt đánh giá &amp; bình luận để đảm bảo tính minh bạch.
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800 block">
                            Chỉ mở khóa Đánh giá &amp; Bình luận sau khi Đặt phòng thành công
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            Sau khi hoàn tất Đặt cọc giữ chỗ hoặc Đặt lịch xem phòng, bạn sẽ được cấp 1 lượt đánh giá cho lần đặt đó.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shrink-0 cursor-pointer transition-colors"
                      >
                        Đặt Giữ Chỗ Ngay
                      </button>
                    </div>
                  )}

                  {/* Danh sách Bình luận */}
                  <div className="space-y-4">
                    {propertyReviews.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        Chưa có bình luận nào cho phòng này. Hãy là người đầu tiên để lại đánh giá nhé!
                      </div>
                    ) : (
                      propertyReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {rev.userAvatar ? (
                                <img
                                  src={rev.userAvatar}
                                  alt={rev.userName}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                                  {rev.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">
                                    {rev.userName}
                                  </span>
                                  {rev.userCollege && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      🎓 {rev.userCollege}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3 h-3 ${
                                          s <= rev.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                                </div>
                              </div>
                            </div>

                            {user?.role === 'admin' && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingToId(replyingToId === rev.id ? null : rev.id);
                                    setReplyText(rev.adminReply || '');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                                >
                                  Phản hồi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteReview(rev.id)}
                                  title="Xóa bình luận này"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-13">
                            {rev.comment}
                          </p>

                          {/* Phản hồi của Admin */}
                          {rev.adminReply && (
                            <div className="ml-8 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                                <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Phản hồi từ Ban Quản Lý {settings.brandName}:</span>
                              </div>
                              <p className="text-slate-700 pl-5">{rev.adminReply}</p>
                            </div>
                          )}

                          {/* Khung nhập phản hồi cho Admin */}
                          {user?.role === 'admin' && replyingToId === rev.id && (
                            <div className="ml-8 pt-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Nhập phản hồi của Ban quản lý..."
                                className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-300 rounded-xl outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!replyText.trim()) return;
                                  replyToReview(rev.id, replyText.trim());
                                  setReplyingToId(null);
                                  setReplyText('');
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                              >
                                Lưu phản hồi
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
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

      {/* MOBILE STICKY BOTTOM ACTION BAR (Hiện trên điện thoại / tablet, ẩn trên PC) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Thông tin giá tóm tắt */}
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-medium block">Giá thuê niêm yết</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 truncate">
                {formatPrice(property.pricePerMonthUSD, 'VND')}
              </span>
              <span className="text-[10px] text-slate-500">/th</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold block truncate">
              Cọc giữ: {formatPrice(property.tokenDepositUSD, 'VND')}
            </span>
          </div>

          {/* Nút thao tác nhanh trên mobile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleContactLandlord}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl font-bold transition-colors cursor-pointer"
              title="Nhắn Zalo tư vấn phòng"
            >
              <Phone className="w-5 h-5 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="py-3 px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Đặt Cọc Giữ Chỗ</span>
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        property={isBookingOpen ? property : null}
        onClose={() => setIsBookingOpen(false)}
      />

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
