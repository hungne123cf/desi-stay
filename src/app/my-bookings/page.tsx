'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { ReviewModal } from '@/components/ReviewModal';
import { Property, Booking } from '@/types';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Phone,
  ExternalLink,
  ArrowRight,
  MapPin,
  QrCode,
  FileText,
  AlertCircle,
  Eye,
  Receipt,
  X,
  CreditCard,
  MessageSquare
} from 'lucide-react';

export default function MyBookingsPage() {
  const { bookings, properties, reviews, settings, formatPrice, getReviewEligibility } =
    useProperties();
  const { user } = useAuth();

  const [filterTab, setFilterTab] = useState<'all' | 'paid' | 'visit' | 'cancelled'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [reviewingProperty, setReviewingProperty] = useState<{
    property: Property;
    booking: Booking;
    eligibility: ReturnType<typeof getReviewEligibility>;
  } | null>(null);

  // Lấy các mã đơn thuộc về tài khoản người dùng hiện tại (Account ID)
  let savedLocalIds: string[] = [];
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unistay_my_booking_ids');
      if (user?.id && user.id !== 'guest') {
        const raw = localStorage.getItem(`unistay_my_booking_ids_${user.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) savedLocalIds = parsed;
        }
      }
    }
  } catch {}

  const myBookings = bookings.filter((b) => {
    if (!b || !user || (!user.id && !user.email)) return false;
    const byAccountLocal =
      savedLocalIds.includes(b.id) || (b.reference ? savedLocalIds.includes(b.reference) : false);
    const byUserId = Boolean(user.id && user.id !== 'guest' && b.userId === user.id);
    const byEmail = Boolean(
      user.email &&
        b.studentEmail &&
        b.studentEmail.toLowerCase().trim() === user.email.toLowerCase().trim()
    );

    return byAccountLocal || byUserId || byEmail;
  });

  const filteredBookings = myBookings.filter((b) => {
    if (filterTab === 'paid') return b.status === 'token_paid' || b.status === 'confirmed';
    if (filterTab === 'visit') return b.paymentMethod === 'pay_on_visit' || b.status === 'pending';
    if (filterTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: Booking['status'], method?: string) => {
    switch (status) {
      case 'token_paid':
        return {
          label: 'Đã nhận cọc VietQR 24/7',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'confirmed':
        return {
          label: 'Đã chốt giữ phòng thành công',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />
        };
      default:
        return {
          label: method === 'vietqr_bank' ? 'Chờ kiểm tra sao kê VietQR' : 'Chờ xác nhận lịch hẹn',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
        };
    }
  };

  const handleOpenZalo = (bookingRef: string, propCode: string) => {
    const adminZalo = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    const text = encodeURIComponent(
      `Chào UniStay, mình cần hỗ trợ đơn đặt phòng mã #${bookingRef} (Phòng ${propCode})`
    );
    window.open(`https://zalo.me/${adminZalo}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <span>Lịch Sử Đặt Cọc</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Lịch Sử Đặt Cọc
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Theo dõi tiến độ cọc VietQR 24/7 và lịch hẹn xem phòng của bạn.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/profile?tab=bookings"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 transition-all inline-flex items-center gap-1.5"
              >
                <span>👤 Mở Trong Hồ Sơ</span>
              </Link>
              <Link
                href="/"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>+ Tìm Phòng</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Banner nhắc đăng nhập cho khách */}
        {!user && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bạn đang xem với tư cách Khách chưa đăng nhập</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Vui lòng đăng nhập để đồng bộ đầy đủ các giao dịch cọc phòng, lưu biên lai thanh toán vĩnh viễn và xem trên mọi thiết bị.
                </p>
              </div>
            </div>
            <Link
              href="/auth/login?next=/my-bookings"
              className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink flex items-center gap-1.5 ${
                filterTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {myBookings.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('paid')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink flex items-center gap-1.5 ${
                filterTab === 'paid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Đã nhận cọc VietQR</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterTab === 'paid' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {myBookings.filter((b) => b.status === 'token_paid' || b.status === 'confirmed').length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('visit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink flex items-center gap-1.5 ${
                filterTab === 'visit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Hẹn xem phòng</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterTab === 'visit' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {myBookings.filter((b) => b.paymentMethod === 'pay_on_visit' || b.status === 'pending').length}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline-block">
            Đồng bộ tự động theo thời gian thực
          </span>
        </div>

        {/* Danh Sách Giao Dịch */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {myBookings.length === 0
                  ? 'Bạn chưa có giao dịch đặt phòng nào'
                  : 'Không có giao dịch nào trong mục này'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Khi bạn quét mã VietQR đặt cọc hoặc đặt lịch hẹn xem phòng, toàn bộ phiếu giao dịch, biên lai và quyền đánh giá sao sẽ xuất hiện tại đây.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Khám Phá Phòng Trọ Ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const matchedProp = properties.find(
                (p) => p.id === b.propertyId || p.code === b.propertyCode
              );
              const statusBadge = getStatusBadge(b.status, b.paymentMethod);
              const eligibility = matchedProp
                ? getReviewEligibility(matchedProp.id, matchedProp.code, user)
                : null;

              // Kiểm tra xem đơn này đã có review chưa
              const hasReviewedThisBooking = reviews.some(
                (r) => r.bookingId === b.id || (b.reference && r.bookingId === b.reference)
              );
              const myReviewForThis = reviews.find(
                (r) => r.bookingId === b.id || (b.reference && r.bookingId === b.reference)
              );

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-6 sm:p-7 space-y-5"
                >
                  {/* Top Bar: Mã đơn & Trạng thái */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-3 py-1 rounded-xl">
                        #{b.reference || b.id}
                      </span>
                      <span className="text-xs text-slate-400">
                        Đặt lúc: {b.createdAt}
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusBadge.color}`}
                    >
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </div>
                  </div>

                  {/* Body: Thông tin phòng trọ + Chi tiết thanh toán */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Cột 1: Thông tin phòng trọ */}
                    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">
                      {matchedProp?.images[0] && (
                        <img
                          src={matchedProp.images[0]}
                          alt={b.propertyTitle}
                          className="w-full sm:w-44 h-32 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      )}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                            {b.propertyCode}
                          </span>
                          <span className="text-xs text-slate-500 uppercase font-semibold">
                            {b.roomType}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {matchedProp ? (
                            <Link href={`/properties/${matchedProp.id}`}>
                              {b.propertyTitle}
                            </Link>
                          ) : (
                            b.propertyTitle
                          )}
                        </h3>

                        {matchedProp && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {matchedProp.area}, {matchedProp.city}
                            </span>
                          </p>
                        )}

                        <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <div>
                            <span className="text-slate-400">Người đặt:</span>{' '}
                            <strong>{b.studentName}</strong> ({b.studentContact})
                          </div>
                          <div>
                            <span className="text-slate-400">Trường:</span>{' '}
                            <span>{b.college || 'Sinh viên'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cột 2: Chi tiết tiền cọc & Biên lai */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Hình thức:</span>
                        <span className="font-bold text-slate-800">
                          {b.paymentMethod === 'vietqr_bank' ? '💳 VietQR Napas 247' : '📅 Hẹn xem phòng'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Tiền cọc giữ chỗ:</span>
                        <span className="font-black text-emerald-700 text-sm">
                          {b.tokenAmountLocal || formatPrice(b.tokenAmountUSD, 'VND')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">
                          {b.visitTimeSlot ? 'Lịch hẹn xem:' : 'Ngày nhận phòng:'}
                        </span>
                        <span className="font-bold text-indigo-700">
                          {b.moveInDate} {b.visitTimeSlot ? `(${b.visitTimeSlot})` : ''}
                        </span>
                      </div>

                      {b.transferContent && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                          <span className="text-slate-500">Nội dung CK:</span>
                          <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {b.transferContent}
                          </span>
                        </div>
                      )}

                      {b.receiptImageUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(b.receiptImageUrl || null)}
                            className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 text-indigo-700 rounded-xl font-bold border border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Lại Ảnh Biên Lai Đã Tải Lên</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions: Nút Đánh Giá & Nhắn Zalo */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Quyền đánh giá sao */}
                    <div>
                      {hasReviewedThisBooking ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Bạn đã gửi đánh giá cho lần đặt phòng này</span>
                          {myReviewForThis && (
                            <span className="flex items-center gap-0.5 ml-1 text-amber-500">
                              {[...Array(myReviewForThis.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </span>
                          )}
                        </div>
                      ) : matchedProp && eligibility && eligibility.remainingReviews > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setReviewingProperty({
                              property: matchedProp,
                              booking: b,
                              eligibility
                            })
                          }
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                        >
                          <Star className="w-4 h-4 fill-slate-950" />
                          <span>Viết Đánh Giá Sao Cho Lần Đặt Này (1 lượt)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Đã sử dụng lượt đánh giá cho phòng này
                        </span>
                      )}
                    </div>

                    {/* Nút Liên hệ Zalo & Xem lại phòng */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenZalo(b.reference || b.id, b.propertyCode)}
                        className="w-full sm:w-auto px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hỗ Trợ Zalo Mã #{b.reference || b.id}</span>
                      </button>

                      {matchedProp && (
                        <Link
                          href={`/properties/${matchedProp.id}`}
                          className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Xem Phòng</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup Xem Lại Biên Lai */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white max-w-2xl sm:max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Ảnh Biên Lai Chuyển Khoản</span>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img
                src={selectedReceipt}
                alt="Biên lai"
                className="max-h-[480px] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-4 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Review Modal khi bấm Đánh Giá trong Lịch Sử Giao Dịch */}
      {reviewingProperty && (
        <ReviewModal
          isOpen={Boolean(reviewingProperty)}
          onClose={() => setReviewingProperty(null)}
          property={reviewingProperty.property}
          booking={reviewingProperty.booking}
          remainingQuota={reviewingProperty.eligibility.remainingReviews}
          totalPurchases={reviewingProperty.eligibility.totalPurchases}
          usedReviews={reviewingProperty.eligibility.usedReviews}
        />
      )}
    </div>
  );
}

