'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PaymentMethod } from '@/types';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { buildVietQrUrl } from '@/data/vietnamBanks';
import { uploadOrCompressImage } from '@/lib/supabase/storage';
import {
  X,
  ShieldCheck,
  QrCode,
  CalendarClock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Phone,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Clock,
  Star
} from 'lucide-react';

interface BookingModalProps {
  property: Property | null;
  onClose: () => void;
}

const VISIT_TIME_SLOTS = [
  'Buổi sáng (08:30 – 11:30)',
  'Buổi chiều (13:30 – 17:30)',
  'Buổi tối (18:00 – 20:30)'
];

export const BookingModal: React.FC<BookingModalProps> = ({ property, onClose }) => {
  const { addBooking, formatPrice, settings } = useProperties();
  const { user } = useAuth();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vietqr_bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState('');
  const [copiedField, setCopiedField] = useState<'acc' | 'amount' | 'content' | null>(null);

  // Form fields
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [studentContact, setStudentContact] = useState(user?.phone || '');
  const [college, setCollege] = useState(user?.college || property?.nearbyUniversity || '');
  const [moveInDate, setMoveInDate] = useState('');
  const [visitTimeSlot, setVisitTimeSlot] = useState(VISIT_TIME_SLOTS[1]);

  useEffect(() => {
    setMoveInDate(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  }, []);

  // Payment proof fields
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [transactionCode, setTransactionCode] = useState('');

  if (!property) return null;

  const amountVND = Math.round(property.tokenDepositUSD * 25400);
  const cleanCode = property.code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const cleanPhone = studentContact.replace(/[^0-9]/g, '').slice(-10);
  const transferContent = `COC ${cleanCode} ${cleanPhone || 'SV'}`;

  const vietQrImageUrl = buildVietQrUrl({
    bankCodeOrName: settings.vietQrBankCode || settings.vietQrBankName,
    accountNumber: settings.vietQrAccountNumber,
    accountHolder: settings.vietQrAccountHolder,
    amountVND,
    transferContent
  });

  const handleCopy = (text: string, field: 'acc' | 'amount' | 'content') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    try {
      const { url } = await uploadOrCompressImage(file);
      setReceiptImageUrl(url);
    } catch {
      // ignore
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentContact.trim()) {
      alert('Vui lòng điền Họ tên và Số điện thoại / Zalo liên hệ.');
      return;
    }
    setStep('payment');
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isVietQR = selectedMethod === 'vietqr_bank';

    const ref = addBooking({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyCode: property.code,
      userId: user?.id || 'guest',
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim() || 'sinhvien@unistay.vn',
      studentContact: studentContact.trim(),
      college: college.trim() || property.nearbyUniversity,
      moveInDate,
      visitTimeSlot: isVietQR ? undefined : visitTimeSlot,
      roomType: property.roomType,
      tokenAmountUSD: isVietQR ? property.tokenDepositUSD : 0,
      tokenAmountLocal: isVietQR ? formatPrice(property.tokenDepositUSD, 'VND') : '0 ₫ (Hẹn xem phòng)',
      currency: 'VND',
      status: isVietQR ? (receiptImageUrl ? 'token_paid' : 'pending') : 'pending',
      paymentMethod: selectedMethod,
      transferContent: isVietQR ? transferContent : undefined,
      receiptImageUrl: receiptImageUrl || undefined,
      transactionReference:
        transactionCode.trim() ||
        (isVietQR ? transferContent : `HEN_XEM_${visitTimeSlot.split(' ')[1]}`),
      adminNotes: isVietQR
        ? receiptImageUrl
          ? `Đã chuyển khoản VietQR (${transferContent}) kèm ảnh Bill biên lai.`
          : `Báo đã chuyển khoản VietQR (${transferContent}) – Chờ kiểm tra sao kê.`
        : `Đặt lịch hẹn đến xem phòng trực tiếp vào ${moveInDate} (${visitTimeSlot}).`
    });

    setConfirmedBookingRef(ref);
    setIsProcessing(false);
    setStep('success');
  };

  const handleOpenZaloOrCall = () => {
    const contact = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    window.open(`https://zalo.me/${contact}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-3xl lg:max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white px-6 sm:px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-100 font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Đặt Cọc Giữ Chỗ VietQR Napas 247 &amp; Đặt Lịch Xem Phòng</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold truncate max-w-xl">{property.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Chọn Hình Thức Ngay Từ Bước 1 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('vietqr_bank')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedMethod === 'vietqr_bank'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Khóa phòng 48h
                    </span>
                  </div>
                  <span className="text-xs font-bold block text-slate-900">
                    Cọc Giữ Chỗ VietQR
                  </span>
                  <span className="text-[11px] text-indigo-700 font-bold">
                    {formatPrice(property.tokenDepositUSD, 'VND')} (Trừ vào tiền thuê)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('pay_on_visit')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedMethod === 'pay_on_visit'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CalendarClock className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Miễn phí 0đ
                    </span>
                  </div>
                  <span className="text-xs font-bold block text-slate-900">
                    Đặt Lịch Xem Trực Tiếp
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Đến xem phòng ưng ý mới cọc
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Họ và tên người thuê *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Khôi"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Số điện thoại / Zalo liên hệ *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentContact}
                      onChange={(e) => setStudentContact(e.target.value)}
                      placeholder="0939 123 456"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email (Nhận phiếu)</label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="sinhvien@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trường Đại học / Đơn vị công tác
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Ví dụ: ĐH Cần Thơ, ĐH FPT Cần Thơ, ĐH Y Dược..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {selectedMethod === 'vietqr_bank'
                        ? 'Ngày dự kiến nhận phòng'
                        : 'Ngày hẹn đến xem phòng'}
                    </label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>

                  {selectedMethod === 'pay_on_visit' ? (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Khung giờ hẹn xem phòng
                      </label>
                      <select
                        value={visitTimeSlot}
                        onChange={(e) => setVisitTimeSlot(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                      >
                        {VISIT_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500">Giá thuê hàng tháng:</span>
                      <span className="text-sm font-black text-slate-900">
                        {formatPrice(property.pricePerMonthUSD, 'VND')} / tháng
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {selectedMethod === 'vietqr_bank'
                    ? 'Tiền cọc giữ chỗ được chuyển thẳng vào tài khoản ngân hàng của Chủ trọ và trừ trực tiếp vào tiền phòng tháng đầu tiên.'
                    : 'Đặt lịch hẹn xem phòng hoàn toàn miễn phí. Chủ trọ sẽ liên hệ qua Zalo/SĐT để đón bạn.'}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {selectedMethod === 'vietqr_bank'
                    ? `Tiếp tục quét mã VietQR (${formatPrice(property.tokenDepositUSD, 'VND')})`
                    : 'Tiếp tục xác nhận lịch hẹn xem phòng'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              {selectedMethod === 'vietqr_bank' ? (
                <>
                  {/* VietQR Napas 247 Card */}
                  <div className="p-5 sm:p-6 bg-indigo-50/60 border border-indigo-200/90 rounded-3xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Dynamic QR Image */}
                      <div className="w-52 h-52 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl border border-slate-200 shadow-md shrink-0 flex items-center justify-center">
                        <img
                          src={vietQrImageUrl}
                          alt="Mã VietQR Napas 247"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Bank Account Details with Copy Buttons */}
                      <div className="flex-1 w-full space-y-3 text-sm bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span>Thông tin chuyển khoản Napas 247</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            Tự Động Báo Có
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500 text-xs">Ngân hàng:</span>
                          <span className="font-bold text-slate-900">{settings.vietQrBankName}</span>
                        </div>

                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500 text-xs">Chủ tài khoản:</span>
                          <span className="font-black text-slate-900 uppercase">
                            {settings.vietQrAccountHolder}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500 text-xs">Số tài khoản:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-indigo-700 font-mono text-base">
                              {settings.vietQrAccountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(settings.vietQrAccountNumber, 'acc')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                              title="Sao chép số tài khoản"
                            >
                              {copiedField === 'acc' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500 text-xs">Số tiền cọc:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-700 text-base">
                              {amountVND.toLocaleString('vi-VN')} ₫
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(String(amountVND), 'amount')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                              title="Sao chép số tiền"
                            >
                              {copiedField === 'amount' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-slate-500 text-xs">Nội dung CK:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-700 font-mono bg-indigo-50 px-2.5 py-1 rounded-lg">
                              {transferContent}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(transferContent, 'content')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                              title="Sao chép nội dung chuyển khoản"
                            >
                              {copiedField === 'content' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedField === 'content' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-center text-slate-600">
                      💡 Mở bất kỳ App Ngân hàng hoặc MoMo/ZaloPay quét mã QR trên, hệ thống sẽ <strong>tự động điền sẵn Số tiền &amp; Nội dung chuyển khoản</strong>.
                    </p>
                  </div>

                  {/* Upload Bill Receipt Section (Thực tế 100% để Chủ trọ đối soát) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          Đính kèm ảnh chụp màn hình chuyển khoản (Bill)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Giúp chủ trọ xác nhận và khóa phòng cho bạn ngay lập tức
                        </span>
                      </div>

                      <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingReceipt ? 'Đang tải...' : 'Tải ảnh Bill'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadReceipt}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {receiptImageUrl && (
                      <div className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <img
                          src={receiptImageUrl}
                          alt="Ảnh Bill chuyển khoản"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-emerald-900">Đã đính kèm ảnh biên lai chuyển khoản!</p>
                          <p className="text-[11px] text-emerald-700">
                            Ảnh Bill này sẽ được gửi trực tiếp vào bảng quản lý của Chủ trọ.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceiptImageUrl('')}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Hoặc nhập Mã giao dịch ngân hàng (Tùy chọn):
                      </label>
                      <input
                        type="text"
                        value={transactionCode}
                        onChange={(e) => setTransactionCode(e.target.value)}
                        placeholder="Ví dụ: FT263029182... (Không bắt buộc nếu đã tải ảnh Bill)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Xác nhận Đặt Lịch Hẹn Xem Phòng Trực Tiếp */
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>Xác nhận lịch hẹn đến xem phòng trực tiếp</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Khách hẹn xem:</span>
                      <span className="font-bold text-slate-900">{studentName} ({studentContact})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngày đến xem:</span>
                      <span className="font-bold text-emerald-700">{moveInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Khung giờ:</span>
                      <span className="font-bold text-indigo-700">{visitTimeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Địa chỉ phòng:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[240px]">
                        {property.address}
                      </span>
                    </div>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Sau khi bấm xác nhận, lịch hẹn sẽ được gửi ngay lập tức tới Bảng điều khiển của Chủ trọ để sắp xếp người mở cửa đón bạn xem phòng.
                  </p>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-3 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-2/3 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Đang gửi xác nhận...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {selectedMethod === 'vietqr_bank'
                          ? 'Tôi Đã Chuyển Khoản • Gửi Xác Nhận'
                          : 'Hoàn Tất Đặt Lịch Xem Phòng'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                  Mã phiếu: {confirmedBookingRef}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-3">
                  {selectedMethod === 'vietqr_bank'
                    ? 'Đã Gửi Yêu Cầu Đặt Cọc Giữ Phòng!'
                    : 'Đã Đặt Lịch Hẹn Xem Phòng Thành Công!'}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  {selectedMethod === 'vietqr_bank'
                    ? 'Thông tin chuyển khoản và biên lai của bạn đã được chuyển thẳng tới Chủ trọ theo thời gian thực.'
                    : `Chủ trọ đã nhận được lịch hẹn xem phòng của bạn vào ngày ${moveInDate} (${visitTimeSlot}).`}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phòng trọ:</span>
                  <span className="font-bold text-slate-900">
                    {property.code} – {property.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người đặt:</span>
                  <span className="font-bold text-slate-800">
                    {studentName} ({studentContact})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hình thức:</span>
                  <span className="font-bold text-indigo-700">
                    {selectedMethod === 'vietqr_bank'
                      ? `Cọc VietQR (${formatPrice(property.tokenDepositUSD, 'VND')})`
                      : `Hẹn xem phòng (${visitTimeSlot})`}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-left">
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block">
                    🎉 Bạn vừa được mở khóa 1 lượt Đánh Giá Sao &amp; Bình Luận!
                  </span>
                  <span className="text-[11px] text-amber-700">
                    Mỗi lần đặt phòng thành công được cấp tối đa 1 lượt đánh giá xác thực.
                  </span>
                </div>
                <Link
                  href={`/properties/${property.id}#reviews`}
                  onClick={onClose}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Đánh Giá Ngay</span>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenZaloOrCall}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Nhắn Zalo Báo Chủ Trọ Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
