'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
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
  MessageSquare,
  Send,
  Trash2,
  CornerDownRight
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
    getReviewEligibility
  } = useProperties();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // State cho chức năng Rating & Comment
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>(user?.name || '');
  const [reviewerCollege, setReviewerCollege] = useState<string>(user?.college || '');
  const [commentText, setCommentText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

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
              const propertyReviews = reviews.filter(
                (r) => r.propertyId === property.id || r.propertyCode === property.code
              );
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
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        <span>Đánh Giá &amp; Bình Luận Thực Tế ({propertyReviews.length})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        100% nhận xét xác thực từ sinh viên đã đặt phòng (Tối đa 1 lượt đánh giá / 1 lần đặt phòng)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 px-4 py-2.5 rounded-2xl">
                      <div className="text-2xl font-black text-amber-600">{property.rating}</div>
                      <div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(property.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {propertyReviews.length > 0
                            ? `${propertyReviews.length} nhận xét xác thực`
                            : 'Đánh giá tiêu chuẩn 5.0'}
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
                    <form
                      onSubmit={handleSubmitReview}
                      className="p-5 bg-slate-50/80 rounded-2xl border border-indigo-200/90 space-y-4 text-xs"
                    >
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-emerald-900">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Đã xác thực đơn đặt phòng{' '}
                            <strong className="font-mono text-indigo-700">
                              #{eligibility.nextBookingToReview.reference || eligibility.nextBookingToReview.id}
                            </strong>
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          Còn {eligibility.remainingReviews} lượt đánh giá (1 lượt / 1 lần đặt)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">
                          Chấm điểm &amp; viết nhận xét thực tế của bạn:
                        </span>

                        {/* Star Picker */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = star <= (hoverRating || ratingInput);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setRatingInput(star)}
                                  className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      active
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300 hover:text-amber-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className="font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full text-[11px]">
                            {ratingLabels[hoverRating || ratingInput]}
                          </span>
                        </div>
                      </div>

                      {!user && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Họ và tên khách đặt phòng *
                            </label>
                            <input
                              type="text"
                              required
                              value={reviewerName || eligibility.nextBookingToReview.studentName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="Ví dụ: Lê Minh Khôi"
                              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Sinh viên trường (Tùy chọn)
                            </label>
                            <input
                              type="text"
                              value={reviewerCollege || eligibility.nextBookingToReview.college}
                              onChange={(e) => setReviewerCollege(e.target.value)}
                              placeholder={`Ví dụ: ${property.nearbyUniversity}`}
                              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* Quick Comment Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 mr-1">Gợi ý nhanh:</span>
                        {[
                          'Phòng sạch đẹp đúng như hình',
                          'Hẻm cao ráo an ninh, không ngập nước',
                          'Giờ giấc tự do, khóa vân tay rất tiện',
                          'Gần trường đi học cực kỳ thuận tiện'
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() =>
                              setCommentText((prev) =>
                                prev ? `${prev}. ${chip}` : chip
                              )
                            }
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          required
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Chia sẻ trải nghiệm thực tế của bạn về phòng trọ, nội thất, an ninh, đường đi..."
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Đang đánh giá với tên{' '}
                          <strong>
                            {user?.name || reviewerName || eligibility.nextBookingToReview.studentName}
                          </strong>
                        </span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Đánh Giá (Sử dụng 1 lượt)</span>
                        </button>
                      </div>
                    </form>
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

      <BookingModal
        property={isBookingOpen ? property : null}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
