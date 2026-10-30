'use client';

import React, { useState, useEffect } from 'react';
import { Property, Booking } from '@/types';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Star,
  CheckCircle2,
  Send,
  Building2,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  booking: Booking | null;
  remainingQuota: number;
  totalPurchases: number;
  usedReviews: number;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: '1 Sao – Cần cải thiện', desc: 'Chưa hài lòng về phòng hoặc dịch vụ' },
  2: { label: '2 Sao – Tạm ổn', desc: 'Đáp ứng nhu cầu cơ bản nhưng cần nâng cấp' },
  3: { label: '3 Sao – Khá tốt', desc: 'Phòng ổn định, đúng như mô tả' },
  4: { label: '4 Sao – Rất hài lòng', desc: 'Phòng sạch đẹp, tiện nghi, an ninh tốt' },
  5: { label: '5 Sao – Xuất sắc, rất đáng thuê', desc: 'Phòng đẹp 100% giống hình, giờ giấc tự do, chủ trọ tuyệt vời' }
};

const QUICK_REVIEW_SUGGESTIONS = [
  'Phòng sạch đẹp, giống hình 100%',
  'Giờ giấc tự do 24/7, khóa vân tay rất an tâm',
  'Gần trường, đi học cực kỳ thuận tiện',
  'Khu vực an ninh, không ngập nước khi mưa',
  'Chủ trọ / Quản lý thân thiện, hỗ trợ nhiệt tình',
  'Wifi mạnh, bãi giữ xe rộng rãi thoáng mát'
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  property,
  booking,
  remainingQuota,
  totalPurchases,
  usedReviews
}) => {
  const { addReview } = useProperties();
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerCollege, setReviewerCollege] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Dùng ref ghi nhớ trạng thái mở để CHỈ khởi tạo lại form 1 lần duy nhất lúc mở modal lên
  // Tuyệt đối không được reset nội dung khi các sự kiện SSE/Realtime nền hoặc re-render chạy định kỳ
  const prevIsOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setReviewerName(user?.name || booking?.studentName || '');
      setReviewerCollege(user?.college || booking?.college || property?.nearbyUniversity || '');
      setRating(5);
      setCommentText('');
      setIsSubmittedSuccess(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const currentBooking = booking;
  const currentRating = hoverRating || rating;
  const activeRatingInfo = RATING_DESCRIPTIONS[currentRating] || RATING_DESCRIPTIONS[5];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const finalName = (user?.name || reviewerName || currentBooking?.studentName || 'Sinh viên').trim();

    addReview({
      bookingId: currentBooking?.id || currentBooking?.reference,
      propertyId: property.id,
      propertyCode: property.code,
      propertyTitle: property.title,
      userName: finalName,
      userEmail: user?.email || currentBooking?.studentEmail,
      userAvatar: user?.avatar,
      userCollege: (user?.college || reviewerCollege || currentBooking?.college || property.nearbyUniversity || '').trim(),
      rating,
      comment: commentText.trim()
    });

    setIsSubmitting(false);
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header rộng rãi */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 flex items-start justify-between gap-4 shrink-0 border-b border-slate-800">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                Đánh Giá Khách Thuê Xác Thực
              </span>
              {currentBooking?.reference && (
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 font-mono text-xs">
                  Mã đơn: #{currentBooking.reference}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white truncate">
              {property.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <span>Mã phòng: <strong className="font-mono text-indigo-300">{property.code}</strong></span>
              <span>•</span>
              <span>{property.area}, {property.city}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Form đánh giá rộng rãi, thoáng mát */}
        {isSubmittedSuccess ? (
          <div className="p-10 sm:p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">
              Gửi Đánh Giá Thành Công!
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Cảm ơn bạn đã đóng góp đánh giá khách quan. Đánh giá của bạn đã được gắn dấu xác thực và hiển thị công khai ngay lập tức.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
            {/* Banner Thông Báo Xác Thực Đơn Đặt Phòng */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-emerald-950 block text-sm">
                    Đã xác thực bạn đã đặt phòng này
                  </span>
                  <span className="text-xs text-emerald-800">
                    Quy tắc hệ thống: Mỗi lần đặt phòng thành công được cấp <strong>tối đa 1 lượt đánh giá</strong>.
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0 self-start sm:self-auto shadow-xs">
                Còn {remainingQuota} lượt đánh giá
              </div>
            </div>

            {/* Khối Chấm Sao Lớn (1 - 5 Sao) */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Mức Độ Hài Lòng Của Bạn Về Phòng Trọ
              </span>

              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = s <= currentRating;
                  return (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 sm:p-2 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 sm:w-11 sm:h-11 transition-all ${
                          active
                            ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-sm border border-amber-200 shadow-2xs">
                {activeRatingInfo.label}
              </div>
              <p className="text-xs text-slate-500">{activeRatingInfo.desc}</p>
            </div>

            {/* Gợi ý nhận xét 1 chạm */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Gợi ý nhận xét nhanh (Bấm để thêm vào nội dung):
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_REVIEW_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setCommentText((prev) => {
                        const trimmed = prev.trim();
                        if (!trimmed) return suggestion;
                        if (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
                          return `${trimmed} ${suggestion}`;
                        }
                        return `${trimmed}. ${suggestion}`;
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-medium transition-all shadow-2xs hover:border-indigo-300 cursor-pointer"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Khung Nhập Chi Tiết Nhận Xét */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Nội dung đánh giá thực tế của bạn *
              </label>
              <textarea
                rows={4}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Mô tả trải nghiệm thực tế: phòng ốc có sạch sẽ, giống ảnh chụp không? Giờ giấc ra vào thế nào? Chủ nhà trọ và an ninh xung quanh ra sao?..."
                className="w-full p-4 text-sm bg-white border border-slate-300 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all leading-relaxed"
              />
            </div>

            {/* Thông Tin Người Đánh Giá */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Họ tên người đánh giá *
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Trường Đại học (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={reviewerCollege}
                  onChange={(e) => setReviewerCollege(e.target.value)}
                  placeholder="Ví dụ: ĐH Cần Thơ / ĐH FPT"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Footer Nút Thao Tác Rộng Rãi */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Đánh giá sẽ được tính vào điểm sao trung bình của phòng trọ ngay lập tức.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="flex-1 sm:flex-none px-7 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Đang gửi đánh giá...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Đánh Giá Xác Thực (1 lượt)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

